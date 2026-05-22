import { DiscoveredItem } from "@/lib/types";

export async function scrapeArxiv(): Promise<DiscoveredItem[]> {
  try {
    const res = await fetch(
      "http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.CL+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=20"
    );
    if (!res.ok) throw new Error(`arXiv API ${res.status}`);

    const xml = await res.text();
    return parseArxivXml(xml);
  } catch (err) {
    console.error("arXiv scraper failed:", err);
    return [];
  }
}

// Fallback for Node.js (no DOMParser)
function parseArxivXml(xml: string): DiscoveredItem[] {
  const items: DiscoveredItem[] = [];
  const entries = xml.split("<entry>").slice(1);

  for (const entry of entries) {
    const getText = (tag: string) => {
      const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
    };

    const title = getText("title");
    const summary = getText("summary").slice(0, 500);
    const id = getText("id");
    const published = getText("published").slice(0, 10);

    if (!title || !id) continue;

    items.push({
      source: "arxiv",
      title,
      url: id,
      summary,
      tags: ["research", "arxiv", published].filter(Boolean),
    });
  }

  return items;
}
