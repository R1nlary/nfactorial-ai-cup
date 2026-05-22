import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { runPipeline } from "@/lib/agents/orchestrator";
import type { ContentRequest } from "@/lib/types";

const generateSchema = z.object({
  topic: z.string().min(1),
  type: z.enum(["tweet", "thread", "quote_retweet", "article"]),
  styleProfileId: z.string().optional(),
  context: z.string().optional(),
  sourceUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = generateSchema.parse(body);
    const contentRequest: ContentRequest = parsed;

    // Fetch style samples if profile specified
    let styleSamples: string[] | undefined;
    if (contentRequest.styleProfileId) {
      const profile = await prisma.styleProfile.findUnique({
        where: { id: contentRequest.styleProfileId },
      });
      if (profile) styleSamples = profile.samples;
    }

    // Run the full 6-agent pipeline
    const { content: editorOutput, traces, iterations } = await runPipeline(
      contentRequest,
      styleSamples,
    );

    const rawOutput = editorOutput.finalContent || editorOutput.content || "";
    const finalText = Array.isArray(rawOutput)
      ? rawOutput.join("\n\n")
      : rawOutput;

    // Save to DB
    const content = await prisma.content.create({
      data: {
        type: contentRequest.type,
        topic: contentRequest.topic,
        input: JSON.stringify(contentRequest),
        drafts: [JSON.stringify(editorOutput)],
        finalContent: finalText,
        status: "completed",
        styleProfileId: contentRequest.styleProfileId,
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

    return NextResponse.json({
      content: rawOutput,
      traces,
      id: content.id,
      iterations,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
