import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { scrapeHackerNews } from "@/lib/scrapers/hackernews";
import type { DiscoveredItem } from "@/lib/types";

const discoverSchema = z.object({
  source: z.enum(["hackernews", "arxiv", "substack"]).optional().default("hackernews"),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = discoverSchema.parse({
      source: searchParams.get("source") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    let items: DiscoveredItem[] = [];

    switch (parsed.source) {
      case "hackernews":
        items = await scrapeHackerNews();
        break;
      case "arxiv":
        // Placeholder: arxiv scraper not yet implemented
        items = [];
        break;
      case "substack":
        // Placeholder: substack scraper not yet implemented
        items = [];
        break;
    }

    items = items.slice(0, parsed.limit);

    // Save discovered items to DB
    for (const item of items) {
      await prisma.discoveredContent.upsert({
        where: { url: item.url },
        update: {
          title: item.title,
          summary: item.summary,
          score: item.score,
          tags: (item.tags ?? []),
        },
        create: {
          source: item.source,
          title: item.title,
          url: item.url,
          summary: item.summary,
          score: item.score,
          tags: (item.tags ?? []),
        },
      });
    }

    return NextResponse.json({ items, count: items.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Discover error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
