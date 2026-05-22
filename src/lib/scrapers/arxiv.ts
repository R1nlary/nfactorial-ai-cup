import { DiscoveredItem } from "@/lib/types";

export async function scrapeArxiv(): Promise<DiscoveredItem[]> {
  try {
    const res = await fetch(
      "http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.CL+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=20"
    );
    if (!res.ok) throw new Error(`arXiv API ${res.status}`);

    const xml = await res.text();
    const doc = new DOMParser
      ? new DOMParser().parseFromString(xml, "text/xml")
      : null;

    // Node.js fallback: manual regex parsing (no DOMParser in Node)
    if (!doc) {
      return parseArxivXml(xml);
    }

    const entries = doc.getElementsByTagName("entry");
    const items: DiscoveredItem[] = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const title = entry.getElementsByTagName("title")[0]?.textContent?.trim() ?? "";
      const summary = entry.getElementsByTagName("summary")[0]?.textContent?.trim() ?? "";
      const id = entry.getElementsByTagName("id")[0]?.textContent?.trim() ?? "";
      const published = entry.getElementsByTagName("published")[0]?.textContent?.trim() ?? "";
      const authors = Array.from(entry.getElementsByTagName("author"))
        .map((a) => a.getElementsByTagName("name")[0]?.textContent?.trim() ?? "")
        .filter(Boolean);

      items.push({
        source: "arxiv",
        title,
        url: id,
        summary: summary.slice(0, 500),
        tags: ["research", "arxiv", ...published ? [published.slice(0, 10)] : []],
      });
    }

    return items;
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
