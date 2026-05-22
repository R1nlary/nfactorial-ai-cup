import { DiscoveredItem } from "@/lib/types";

interface HNHit {
  title: string;
  url: string;
  points: number;
  num_comments: number;
  objectID: string;
}

export async function scrapeHackerNews(): Promise<DiscoveredItem[]> {
  try {
    const res = await fetch(
      "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30"
    );
    if (!res.ok) throw new Error(`HN API ${res.status}`);

    const data = await res.json();
    const hits: HNHit[] = data.hits ?? [];

    return hits
      .filter((h) => h.points > 50)
      .sort((a, b) => b.points - a.points)
      .map((h) => ({
        source: "hackernews",
        title: h.title,
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        summary: `${h.num_comments} comments`,
        score: h.points,
        tags: ["tech", "hackernews"],
      }));
  } catch (err) {
    console.error("HackerNews scraper failed:", err);
    return [];
  }
}
