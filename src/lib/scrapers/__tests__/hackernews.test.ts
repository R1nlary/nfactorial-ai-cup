import { describe, it, expect, vi, beforeEach } from "vitest";
import { scrapeHackerNews } from "../hackernews";

const mockResponse = {
  hits: [
    { title: "Show HN: A Cool Project", url: "https://example.com/cool", points: 120, num_comments: 45 },
    { title: "Low Score Post", url: "https://example.com/low", points: 10, num_comments: 2 },
    { title: "AI Research Breakthrough", url: "https://example.com/ai", points: 200, num_comments: 80 },
  ],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("scrapeHackerNews", () => {
  it("fetches and returns items with score > 50", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const items = await scrapeHackerNews();
    expect(items.length).toBe(2);
    expect(items.every((i) => (i.score ?? 0) > 50)).toBe(true);
  });

  it("sets source to hackernews", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const items = await scrapeHackerNews();
    expect(items.every((i) => i.source === "hackernews")).toBe(true);
  });

  it("returns empty array on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    const items = await scrapeHackerNews();
    expect(items).toEqual([]);
  });

  it("returns empty array on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    const items = await scrapeHackerNews();
    expect(items).toEqual([]);
  });
});
