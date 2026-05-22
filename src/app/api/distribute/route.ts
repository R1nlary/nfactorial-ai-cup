import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { DistributionAgent } from "@/lib/agents/distribution";

const schema = z.object({
  contentId: z.string().optional(),
  content: z.string().optional(),
  contentType: z.string().default("tweet"),
  topic: z.string().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);

    let contentText = parsed.content || "";
    let contentId = parsed.contentId;

    // If contentId provided, fetch from DB
    if (contentId && !contentText) {
      const record = await prisma.content.findUnique({ where: { id: contentId } });
      if (record?.finalContent) {
        contentText = record.finalContent;
      }
    }

    if (!contentText) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    // Run distribution agent
    const agent = new DistributionAgent();
    const result = await agent.run({
      content: contentText,
      contentType: parsed.contentType,
      topic: parsed.topic,
    });

    // Persist the plan and the agent trace (so it shows on the Traces page)
    const [plan] = await Promise.all([
      prisma.distributionPlan.create({
        data: {
          contentId: contentId || null,
          platform: "twitter",
          status: "draft",
          strategy: JSON.stringify(result.output),
        },
      }),
      prisma.agentTrace.create({
        data: {
          contentId: contentId || null,
          agentName: result.trace.agentName,
          input: result.trace.input as any,
          output: result.trace.output as any,
          reasoning: result.trace.reasoning,
          model: result.trace.model,
          tokens: result.trace.tokens as any,
          durationMs: result.trace.durationMs,
        },
      }),
    ]);

    return NextResponse.json({
      plan: result.output,
      planId: plan.id,
      trace: result.trace,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Distribution error:", error);
    return NextResponse.json({ error: "Failed to generate distribution plan" }, { status: 500 });
  }
}
