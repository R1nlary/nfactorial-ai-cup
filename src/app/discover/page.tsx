"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RefreshCw, ArrowRight, Flame, GraduationCap, Mail, Sparkles } from "lucide-react";
import Link from "next/link";

interface DiscoveredItem {
  source: string;
  title: string;
  url: string;
  summary?: string;
  score?: number;
}

const SOURCE_CONFIG: Record<string, { color: string; bg: string; icon: typeof Flame; label: string }> = {
  hackernews: { color: "text-orange-400", bg: "bg-orange-400/10", icon: Flame, label: "HN" },
  arxiv: { color: "text-violet-400", bg: "bg-violet-400/10", icon: GraduationCap, label: "arXiv" },
  substack: { color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Mail, label: "Substack" },
};

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/[0.04] bg-[#0e0e11] p-5">
      <div className="skeleton h-3 w-16 mb-3" />
      <div className="skeleton h-4 w-5/6 mb-2" />
      <div className="skeleton h-3 w-full mb-1" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  );
}

export default function DiscoverPage() {
  const [items, setItems] = useState<DiscoveredItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("all");

  async function fetchContent(s?: string) {
    setLoading(true);
    try {
      const param = s && s !== "all" ? `?source=${s}` : "";
      const res = await fetch(`/api/discover${param}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        toast.error("Failed to load content");
      }
    } catch {
      toast.error("Network error — check your connection");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchContent();
  }, []);

  function handleSourceChange(s: string) {
    setSource(s);
    fetchContent(s);
  }

  const filtered =
    source === "all" ? items : items.filter((i) => i.source === source);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#f5c518]" />
            <p className="font-[var(--font-mono)] text-[10px] tracking-widest text-[#f5c518] uppercase">
              Content Discovery
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
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
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="animate-fade-in-up animate-delay-1">
        <Tabs value={source} onValueChange={handleSourceChange}>
          <TabsList className="bg-white/[0.02] border border-white/[0.06]">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="hackernews" className="text-xs gap-1">
              <Flame className="w-3 h-3" />
              HN
            </TabsTrigger>
            <TabsTrigger value="arxiv" className="text-xs gap-1">
              <GraduationCap className="w-3 h-3" />
              arXiv
            </TabsTrigger>
            <TabsTrigger value="substack" className="text-xs gap-1">
              <Mail className="w-3 h-3" />
              Substack
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content grid */}
      <div className="mt-6 animate-fade-in-up animate-delay-2">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-white/[0.04] border-dashed bg-[#0e0e11]/50 p-16 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5 text-zinc-700" />
            </div>
            <p className="text-sm text-zinc-600">
              {source === "all"
                ? "No content found. Try refreshing."
                : `No ${source} content found. Try a different source.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((item) => {
              const config = SOURCE_CONFIG[item.source];
              const Icon = config?.icon || Flame;

              return (
                <div
                  key={item.url}
                  className="group rounded-xl border border-white/[0.04] hover:border-white/[0.08] bg-[#0e0e11] p-5 transition-all duration-200 card-hover"
                >
                  {/* Source badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config?.bg || "bg-zinc-800"}`}>
                      <Icon className={`w-2.5 h-2.5 ${config?.color || "text-zinc-400"}`} />
                      <span className={`text-[9px] font-medium uppercase font-[var(--font-mono)] ${config?.color || "text-zinc-400"}`}>
                        {config?.label || item.source}
                      </span>
                    </div>
                    {item.score != null && item.score > 0 && (
                      <span className="text-[10px] text-zinc-600 font-[var(--font-mono)]">
                        {item.score} pts
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h3 className="text-sm font-medium leading-snug mb-2 group-hover:text-white transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </a>

                  {/* Summary */}
                  {item.summary && (
                    <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 mb-3">
                      {item.summary}
                    </p>
                  )}

                  {/* Generate CTA */}
                  <Link
                    href={`/create?topic=${encodeURIComponent(item.title)}&type=tweet`}
                    className="inline-flex items-center gap-1 text-[11px] text-[#f5c518]/70 hover:text-[#f5c518] font-medium transition-colors"
                  >
                    Generate from this
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
