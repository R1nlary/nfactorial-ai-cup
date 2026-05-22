"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DiscoveredItem {
  source: string;
  title: string;
  url: string;
  summary?: string;
  score?: number;
}

export default function DiscoverPage() {
  const [items, setItems] = useState<DiscoveredItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("all");

  async function fetchContent(s?: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/discover${s && s !== "all" ? `?source=${s}` : ""}`);
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
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Discover</h2>
        <Button variant="outline" onClick={() => fetchContent(source)}>
          Refresh
        </Button>
      </div>

      <Tabs value={source} onValueChange={(v) => setSource(v)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="hackernews">Hacker News</TabsTrigger>
          <TabsTrigger value="arxiv">arXiv</TabsTrigger>
          <TabsTrigger value="substack">Substack</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading...</div>
      ) : (
        <div className="space-y-3 mt-4">
          {filtered.map((item) => (
            <div
              key={item.url}
              className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    {item.title}
                  </a>
                  {item.summary && (
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary">{item.source}</Badge>
                  {item.score && (
                    <span className="text-xs text-zinc-500">
                      ↑ {item.score}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              No content found. Try refreshing.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
