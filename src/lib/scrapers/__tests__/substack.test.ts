import { describe, it, expect, vi, beforeEach } from "vitest";
import { scrapeSubstack } from "../substack";

const mockRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>The Future of AI Agents</title>
      <link>https://example.substack.com/p/ai-agents</link>
      <description><![CDATA[A deep exploration of autonomous AI systems.]]></description>
      <pubDate>Mon, 15 Jan 2024 00:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Why Startups Fail</title>
      <link>https://example.substack.com/p/startups</link>
      <description>Common patterns in startup failures.</description>
      <pubDate>Tue, 16 Jan 2024 00:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("scrapeSubstack", () => {
  it("fetches and parses RSS feeds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockRss),
    }));

    const items = await scrapeSubstack();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].source).toBe("substack");
  });

  it("extracts title, url, and summary from RSS items", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockRss),
    }));

    const items = await scrapeSubstack();
    const first = items[0];
    expect(first.title).toBe("The Future of AI Agents");
    expect(first.url).toContain("substack.com");
    expect(first.summary).toBeTruthy();
  });

  it("handles CDATA sections in descriptions", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockRss),
    }));

    const items = await scrapeSubstack();
    const aiItem = items.find((i) => i.title.includes("AI Agents"));
    expect(aiItem?.summary).toContain("autonomous AI systems");
  });

  it("continues when some feeds fail", async () => {
    let callCount = 0;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount <= 2) {
        return Promise.reject(new Error("Feed timeout"));
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve(mockRss) });
    }));

    const items = await scrapeSubstack();
    expect(items.length).toBeGreaterThan(0);
  });

  it("returns empty array when all feeds fail", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    const items = await scrapeSubstack();
    expect(items).toEqual([]);
  });
});
