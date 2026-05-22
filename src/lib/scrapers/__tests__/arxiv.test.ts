import { describe, it, expect, vi, beforeEach } from "vitest";
import { scrapeArxiv } from "../arxiv";

const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <entry>
    <id>http://arxiv.org/abs/2401.00001v1</id>
    <title>Attention Is All You Need (Again)</title>
    <summary>We propose a new transformer architecture that improves upon the original.</summary>
    <published>2024-01-15T00:00:00Z</published>
    <author><name>John Doe</name></author>
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2401.00002v1</id>
    <title>Scaling Laws for Language Models</title>
    <summary>An empirical study of scaling behavior in large language models.</summary>
    <published>2024-01-16T00:00:00Z</published>
    <author><name>Jane Smith</name></author>
  </entry>
</feed>`;

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("scrapeArxiv", () => {
  it("parses XML and returns items", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockXml),
    }));

    const items = await scrapeArxiv();
    expect(items.length).toBe(2);
    expect(items[0].title).toBe("Attention Is All You Need (Again)");
    expect(items[0].source).toBe("arxiv");
    expect(items[0].url).toContain("arxiv.org");
  });

  it("sets source to arxiv for all items", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockXml),
    }));

    const items = await scrapeArxiv();
    expect(items.every((i) => i.source === "arxiv")).toBe(true);
  });

  it("truncates summaries to 500 chars", async () => {
    const longSummary = "A".repeat(600);
    const longXml = `<feed><entry><id>http://arxiv.org/test</id><title>Test</title><summary>${longSummary}</summary><published>2024-01-01</published></entry></feed>`;

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(longXml),
    }));

    const items = await scrapeArxiv();
    expect(items[0].summary!.length).toBeLessThanOrEqual(500);
  });

  it("returns empty array on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    const items = await scrapeArxiv();
    expect(items).toEqual([]);
  });
});
