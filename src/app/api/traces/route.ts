import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const contentId = searchParams.get("contentId");
    const exportFlag = searchParams.get("export");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const skip = (page - 1) * limit;

    // Export all traces as JSON
    if (exportFlag === "true") {
      const allTraces = await prisma.agentTrace.findMany({
        orderBy: { timestamp: "desc" },
      });
      return NextResponse.json(allTraces);
    }

    // Traces for specific content
    if (contentId) {
      const traces = await prisma.agentTrace.findMany({
        where: { contentId },
        orderBy: { timestamp: "desc" },
      });
      return NextResponse.json({ traces, count: traces.length });
    }

    // Paginated list of all traces
    const [traces, total] = await Promise.all([
      prisma.agentTrace.findMany({
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
        include: { content: { select: { topic: true, type: true } } },
      }),
      prisma.agentTrace.count(),
    ]);

    return NextResponse.json({
      traces,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Traces error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
