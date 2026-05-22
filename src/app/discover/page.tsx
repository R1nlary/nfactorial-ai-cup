"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DiscoveredItem {
  source: string;
  title: string;
  url: string;
  summary?: string;
  score?: number;
}

const SOURCE_COLORS: Record<string, string> = {
  hackernews: "text-orange-400",
  arxiv: "text-violet-400",
  substack: "text-emerald-400",
};

export default function DiscoverPage() {
  const [items, setItems] = useState<DiscoveredItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("all");

  async function fetchContent(s?: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/discover${s && s !== "all" ? `?source=${s}` : ""}`
      );
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchContent();
  }, []);

  const filtered =
    source === "all" ? items : items.filter((i) => i.source === source);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Discover
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Trending content from HN, arXiv & Substack
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-zinc-500 hover:text-white"
          onClick={() => fetchContent(source)}
        >
          Refresh
        </Button>
      </div>

      <Tabs value={source} onValueChange={(v) => setSource(v)}>
        <TabsList className="bg-white/[0.02] border border-white/[0.06]">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value="hackernews" className="text-xs">
            HN
          </TabsTrigger>
          <TabsTrigger value="arxiv" className="text-xs">
            arXiv
          </TabsTrigger>
          <TabsTrigger value="substack" className="text-xs">
            Substack
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="text-center py-16 text-zinc-600 text-sm">
          Loading...
        </div>
      ) : (
        <div className="space-y-2 mt-6">
          {filtered.map((item) => (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-white/[0.04] hover:border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.02] p-4 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-1">
                      {item.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-medium uppercase ${SOURCE_COLORS[item.source] || "text-zinc-500"}`}
                  >
                    {item.source}
                  </span>
                  {item.score && (
                    <span className="text-[10px] text-zinc-600">
                      ↑ {item.score}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-zinc-600 text-sm">
              No content found. Try refreshing.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
