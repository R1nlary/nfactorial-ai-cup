import { DiscoveredItem } from "@/lib/types";

const FEEDS = [
  { name: "Stratechery", url: "https://stratechery.com/feed" },
  { name: "Lenny's Newsletter", url: "https://lennysnewsletter.com/feed" },
  { name: "One Useful Thing", url: "https://www.oneusefulthing.org/feed" },
  { name: "Latent Space", url: "https://www.latent.space/feed" },
  { name: "The Pragmatic Engineer", url: "https://blog.pragmaticengineer.com/feed" },
  { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/" },
  { name: "Interconnected", url: "https://interconnected.org/feed" },
];

const FETCH_OPTS: RequestInit = {
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; AI-Cup-Bot/1.0; +https://nfactorial-ai-cup.vercel.app)",
    "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
  signal: AbortSignal.timeout(12000),
};

function parseXml(xml: string, sourceName: string): DiscoveredItem[] {
  const items: DiscoveredItem[] = [];
  // Handle both RSS <item> and Atom <entry>
  const entries = xml.split(/<(?:item|entry)[^>]*>/i).slice(1);

  for (const entry of entries) {
    const getText = (tag: string) => {
      const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
      return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").replace(/<[^>]+>/g, "").trim() : "";
    };

    // Atom uses <link href="...">, RSS uses <link>text</link>
    let link = getText("link");
    if (!link) {
      const hrefMatch = entry.match(/<link[^>]+href="([^"]+)"[^>]*>/i);
      link = hrefMatch ? hrefMatch[1] : "";
    }

    const title = getText("title");
    const description = getText("description") || getText("summary") || getText("content");
    const pubDate = getText("pubDate") || getText("published") || getText("updated");

    if (!title || !link) continue;

    items.push({
      source: "substack",
      title,
      url: link,
      summary: description.slice(0, 300),
      tags: ["newsletter", sourceName.toLowerCase().replace(/[^a-z0-9]+/g, "-"), pubDate.slice(0, 10)].filter(Boolean),
    });
  }

  return items;
}

export async function scrapeSubstack(): Promise<DiscoveredItem[]> {
  // Hard 10s timeout for the entire scrape
  const timeout = AbortSignal.timeout(10000);

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, { ...FETCH_OPTS, signal: timeout });
      if (!res.ok) throw new Error(`${feed.name}: ${res.status}`);
      const xml = await res.text();
      return parseXml(xml, feed.name);
    })
  );

  const items: DiscoveredItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
    else console.error("Feed failed:", r.reason);
  }
  return items;
}
