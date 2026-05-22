import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { BaseAgent } from "@/lib/agents/base-agent";
import { RESEARCH_SYSTEM_PROMPT } from "@/lib/prompts/research";
import { WRITER_SYSTEM_PROMPT } from "@/lib/prompts/writer";
import { EDITOR_SYSTEM_PROMPT } from "@/lib/prompts/editor";
import { detectSlop, cleanSlop } from "@/lib/anti-slop";
import type { ContentType, ContentRequest, AgentTraceData, ResearchOutput, DraftOutput, EditorOutput } from "@/lib/types";

const generateSchema = z.object({
  topic: z.string().min(1),
  type: z.enum(["tweet", "thread", "quote_retweet", "article"]),
  styleProfileId: z.string().optional(),
  context: z.string().optional(),
  sourceUrl: z.string().optional(),
});

class ResearchAgent extends BaseAgent {
  name = "researcher";
  systemPrompt = RESEARCH_SYSTEM_PROMPT;
}

class WriterAgent extends BaseAgent {
  name = "writer";
  systemPrompt = WRITER_SYSTEM_PROMPT;
}

class EditorAgent extends BaseAgent {
  name = "editor";
  systemPrompt = EDITOR_SYSTEM_PROMPT;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = generateSchema.parse(body);

    const contentRequest: ContentRequest = parsed;
    const traces: AgentTraceData[] = [];

    // Step 1: Research
    const researcher = new ResearchAgent();
    const { output: researchOutput, trace: researchTrace } = await researcher.run({
      topic: contentRequest.topic,
      type: contentRequest.type,
      context: contentRequest.context,
      sourceUrl: contentRequest.sourceUrl,
    });
    traces.push(researchTrace);

    // Step 2: Write draft
    const writer = new WriterAgent();
    const styleContext = contentRequest.styleProfileId
      ? await prisma.styleProfile.findUnique({ where: { id: contentRequest.styleProfileId } })
      : null;

    const { output: draftOutput, trace: writerTrace } = await writer.run({
      topic: contentRequest.topic,
      type: contentRequest.type,
      research: researchOutput,
      styleSamples: styleContext?.samples ?? [],
    });
    traces.push(writerTrace);

    // Step 3: Anti-slop check
    const draft = (draftOutput as DraftOutput).draft;
    const draftText = Array.isArray(draft) ? draft.join(" ") : draft;
    const slopResult = detectSlop(draftText);

    // Step 4: Edit
    const editor = new EditorAgent();
    const { output: editorOutput, trace: editorTrace } = await editor.run({
      draft: draftOutput,
      slopScore: slopResult.score,
      slopPhrases: slopResult.found,
      type: contentRequest.type,
    });
    traces.push(editorTrace);

    const finalContent = (editorOutput as EditorOutput).finalContent;
    const finalText = Array.isArray(finalContent) ? finalContent.join("\n\n") : finalContent;

    // Save to DB
    const content = await prisma.content.create({
      data: {
        type: contentRequest.type,
        topic: contentRequest.topic,
        input: JSON.stringify(contentRequest),
        drafts: JSON.stringify([draftOutput as string]),
        finalContent: finalText,
        status: "completed",
        styleProfileId: contentRequest.styleProfileId,
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
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
