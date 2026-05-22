import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { WriterAgent } from "@/lib/agents/writer";
import { StyleReviewerAgent } from "@/lib/agents/style-reviewer";
import { FactCheckerAgent } from "@/lib/agents/fact-checker";
import { EditorAgent } from "@/lib/agents/editor";
import { detectSlop, cleanSlop } from "@/lib/anti-slop";
import type { AgentTraceData, EditorOutput } from "@/lib/types";

const quoteRetweetSchema = z.object({
  tweetUrl: z.string().url(),
  tweetText: z.string().optional(),
  angle: z.enum(["agree", "disagree", "add_context", "humor"]).optional().default("add_context"),
  styleProfileId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quoteRetweetSchema.parse(body);
    const traces: AgentTraceData[] = [];

    // Fetch style samples if profile specified
    let styleSamples: string[] | undefined;
    if (parsed.styleProfileId) {
      const profile = await prisma.styleProfile.findUnique({
        where: { id: parsed.styleProfileId },
      });
      if (profile) styleSamples = profile.samples;
    }

    // 1. Write quote tweet
    const writer = new WriterAgent();
    const draftResult = await writer.run({
      angle: {
        hook: `Quote retweet with angle: ${parsed.angle}`,
        points: [`React to: ${parsed.tweetText ?? parsed.tweetUrl}`],
        cta: "",
        score: 80,
      },
      research: {
        themes: [parsed.angle],
        dataPoints: [],
        angles: [`${parsed.angle} take on the original tweet`],
        sources: [parsed.tweetUrl],
      },
      styleSamples,
      contentType: "quote_retweet",
    });
    traces.push(draftResult.trace);

    // Clean slop from draft
    const rawDraft = draftResult.output.draft;
    const cleanedDraft = Array.isArray(rawDraft) ? rawDraft.map(cleanSlop) : cleanSlop(rawDraft);

    // 2. Style review + fact check in parallel
    const [styleResult, factResult] = await Promise.all([
      new StyleReviewerAgent().run({ draft: cleanedDraft, styleSamples }),
      new FactCheckerAgent().run({ draft: cleanedDraft }),
    ]);
    traces.push(styleResult.trace);
    traces.push(factResult.trace);

    // 3. Edit with full feedback
    const slopResult = detectSlop(
      Array.isArray(cleanedDraft) ? cleanedDraft.join(" ") : cleanedDraft,
    );

    const editor = new EditorAgent();
    const editorResult = await editor.run({
      draft: { draft: cleanedDraft, wordCount: draftResult.output.wordCount },
      styleReview: styleResult.output,
      factCheck: factResult.output,
      contentType: "quote_retweet",
      slopPhrases: slopResult.found,
      slopScore: slopResult.score,
    });
    traces.push(editorResult.trace);

    const editorOut = editorResult.output as EditorOutput;
    const rawContent = editorOut.finalContent || editorOut.content || "";
    const finalText = Array.isArray(rawContent) ? rawContent.join("\n\n") : rawContent;

    // Save to DB
    const content = await prisma.content.create({
      data: {
        type: "quote_retweet",
        topic: parsed.tweetUrl,
        input: JSON.stringify(parsed),
        drafts: [JSON.stringify(draftResult.output)],
        finalContent: finalText,
        status: "completed",
        styleProfileId: parsed.styleProfileId,
        agentTraces: {
          create: traces.map((t) => ({
            agentName: t.agentName,
            input: t.input as any,
            output: t.output as any,
            reasoning: t.reasoning,
            model: t.model,
            tokens: t.tokens as any,
            durationMs: t.durationMs,
          })),
        },
      },
    });

    return NextResponse.json({ content: rawContent, traces, id: content.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Quote retweet error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
