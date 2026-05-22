import { DiscoveredItem } from "@/lib/types";

const FEEDS = [
  { name: "Stratechery", url: "https://stratechery.com/feed" },
  { name: "Lenny's Newsletter", url: "https://lennysnewsletter.com/feed" },
  { name: "One Useful Thing", url: "https://www.oneusefulthing.org/feed" },
  { name: "Ben's Bites", url: "https://bensbites.beehiiv.com/feed" },
  { name: "The Rundown", url: "https://www.therundown.ai/feed" },
  { name: "Superhuman AI", url: "https://www.superhuman.ai/feed" },
  { name: "Ahead of AI", url: "https://aheadof.ai/feed" },
  { name: "Latent Space", url: "https://www.latent.space/feed" },
];

function parseRssXml(xml: string, sourceName: string): DiscoveredItem[] {
  const items: DiscoveredItem[] = [];
  // Split on <item> tags
  const entries = xml.split(/<item[^>]*>/i).slice(1);

  for (const entry of entries) {
    const getText = (tag: string) => {
      const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
      return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").replace(/<[^>]+>/g, "").trim() : "";
    };

    const title = getText("title");
    const link = getText("link");
    const description = getText("description").slice(0, 300);
    const pubDate = getText("pubDate");
    const creator = getText("dc:creator") || getText("author");

    if (!title || !link) continue;

    items.push({
      source: "substack",
      title,
      url: link,
      summary: description,
      tags: ["newsletter", sourceName.toLowerCase().replace(/\s+/g, "-"), pubDate].filter(Boolean),
    });
  }

  return items;
}

export async function scrapeSubstack(): Promise<DiscoveredItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`${feed.name}: ${res.status}`);
      const xml = await res.text();
      return parseRssXml(xml, feed.name);
    })
  );

  const items: DiscoveredItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
    else console.error("Substack feed failed:", r.reason);
  }
  return items;
}
