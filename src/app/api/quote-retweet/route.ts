import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { BaseAgent } from "@/lib/agents/base-agent";
import { WRITER_SYSTEM_PROMPT } from "@/lib/prompts/writer";
import { EDITOR_SYSTEM_PROMPT } from "@/lib/prompts/editor";
import type { AgentTraceData, EditorOutput } from "@/lib/types";

const quoteRetweetSchema = z.object({
  tweetUrl: z.string().url(),
  tweetText: z.string().optional(),
  angle: z.enum(["agree", "disagree", "add_context", "humor"]).optional().default("add_context"),
  styleProfileId: z.string().optional(),
});

class QuoteTweetAgent extends BaseAgent {
  name = "quote-tweet-writer";
  systemPrompt = WRITER_SYSTEM_PROMPT;
}

class EditorAgent extends BaseAgent {
  name = "editor";
  systemPrompt = EDITOR_SYSTEM_PROMPT;
}

class StyleCheckAgent extends BaseAgent {
  name = "style-checker";
  systemPrompt = `You review content against a style profile and suggest improvements to match the voice.
Output JSON: { "matches": boolean, "suggestions": ["suggestion1", ...], "adjustedContent": "final adjusted text" }`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quoteRetweetSchema.parse(body);

    const traces: AgentTraceData[] = [];

    // Step 1: Research tweet context
    const contextInfo = {
      tweetUrl: parsed.tweetUrl,
      tweetText: parsed.tweetText ?? "Unknown tweet content",
      angle: parsed.angle,
    };

    // Step 2: Generate quote tweet response
    const writer = new QuoteTweetAgent();
    const { output: draftOutput, trace: writerTrace } = await writer.run({
      task: "quote_retweet",
      originalTweet: contextInfo.tweetText,
      tweetUrl: parsed.tweetUrl,
      angle: parsed.angle,
      maxLength: 280,
    });
    traces.push(writerTrace);

    // Step 3: Style check if profile provided
    let adjustedContent = (draftOutput as { draft: string }).draft;

    if (parsed.styleProfileId) {
      const styleProfile = await prisma.styleProfile.findUnique({
        where: { id: parsed.styleProfileId },
      });

      if (styleProfile) {
        const styleChecker = new StyleCheckAgent();
        const { output: styleOutput, trace: styleTrace } = await styleChecker.run({
          content: adjustedContent,
          styleSamples: styleProfile.samples,
          description: styleProfile.description,
        });
        traces.push(styleTrace);

        const style = styleOutput as { adjustedContent?: string };
        if (style.adjustedContent) {
          adjustedContent = style.adjustedContent;
        }
      }
    }

    // Step 4: Final edit
    const editor = new EditorAgent();
    const { output: editorOutput, trace: editorTrace } = await editor.run({
      draft: { draft: adjustedContent },
      type: "quote_retweet",
    });
    traces.push(editorTrace);

    const finalContent = (editorOutput as EditorOutput).finalContent;
    const finalText = Array.isArray(finalContent) ? finalContent.join("\n\n") : finalContent;

    // Save to DB
    const content = await prisma.content.create({
      data: {
        type: "quote_retweet",
        topic: parsed.tweetUrl,
        input: JSON.stringify(parsed),
        drafts: JSON.stringify([draftOutput as string]),
        finalContent: finalText,
        status: "completed",
        styleProfileId: parsed.styleProfileId,
        agentTraces: {
          create: traces.map((t) => ({
            agentName: t.agentName,
            input: JSON.stringify(t.input),
            output: JSON.stringify(t.output),
            reasoning: t.reasoning,
            model: t.model,
            tokens: t.tokens ? JSON.stringify(t.tokens) : null,
            durationMs: t.durationMs,
          })),
        },
      },
    });

    return NextResponse.json({ content: finalContent, traces, id: content.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Quote retweet error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
