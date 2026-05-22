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

    // Save plan to DB
    const plan = await prisma.distributionPlan.create({
      data: {
        contentId: contentId || null,
        platform: "twitter",
        status: "draft",
        strategy: JSON.stringify(result.output),
      },
    });

    return NextResponse.json({
      plan: result.output,
      planId: plan.id,
      trace: result.trace,
    });
  } catch (error) {
    console.error("Distribution error:", error);
    return NextResponse.json({ error: "Failed to generate distribution plan" }, { status: 500 });
  }
}
