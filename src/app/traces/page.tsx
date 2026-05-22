"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Activity, Download, ChevronDown, ChevronUp, Clock, Cpu, Zap } from "lucide-react";

interface Trace {
  id: string;
  agentName: string;
  model: string;
  durationMs: number;
  tokens: { prompt: number; completion: number } | null;
  timestamp: string;
  input: unknown;
  output: unknown;
  reasoning: string | null;
}

const AGENT_COLORS: Record<string, string> = {
  researcher: "#f5c518",
  writer: "#e85d75",
  editor: "#60a5fa",
  "style-reviewer": "#a78bfa",
  "fact-checker": "#34d399",
  outline: "#ff6b35",
};

function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

export default function TracesPage() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchTraces();
  }, []);

  async function fetchTraces() {
    setLoading(true);
    try {
      const res = await fetch("/api/traces");
      if (res.ok) {
        const data = await res.json();
        setTraces(data.traces || []);
      }
    } catch {
      toast.error("Failed to load traces");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      const res = await fetch("/api/traces?export=true");
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "agent-traces.json";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Traces exported");
      }
    } catch {
      toast.error("Export failed");
    }
  }

  const totalTokens = traces.reduce((sum, t) =>
    sum + (t.tokens ? t.tokens.prompt + t.tokens.completion : 0), 0);
  const totalDuration = traces.reduce((sum, t) => sum + t.durationMs, 0);
  const uniqueAgents = new Set(traces.map((t) => t.agentName)).size;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-[#f5c518]" />
            <p className="font-[var(--font-mono)] text-[10px] tracking-widest text-[#f5c518] uppercase">
              Execution Log
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Agent Traces
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Full execution log of every agent call
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-zinc-400 hover:text-[#f5c518] border border-white/[0.06] hover:border-[#f5c518]/20"
          onClick={handleExport}
        >
          <Download className="w-3 h-3 mr-1.5" />
          Export for Submission
        </Button>
      </div>

      {/* Stats */}
      {traces.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-in-up animate-delay-1">
          <div className="rounded-xl border border-white/[0.06] bg-[#0e0e11] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-[#f5c518]" />
              <span className="text-[10px] text-zinc-500 uppercase font-[var(--font-mono)]">
                Total Calls
              </span>
            </div>
            <span className="text-lg font-bold">{traces.length}</span>
            <span className="text-[10px] text-zinc-600 ml-1.5">
              across {uniqueAgents} agents
            </span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#0e0e11] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span className="text-[10px] text-zinc-500 uppercase font-[var(--font-mono)]">
                Tokens Used
              </span>
            </div>
            <span className="text-lg font-bold">
              {totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens}
            </span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#0e0e11] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-[#34d399]" />
              <span className="text-[10px] text-zinc-500 uppercase font-[var(--font-mono)]">
                Total Time
              </span>
            </div>
            <span className="text-lg font-bold">
              {(totalDuration / 1000).toFixed(1)}s
            </span>
          </div>
        </div>
      )}

      {/* Traces list */}
      <div className="animate-fade-in-up animate-delay-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.04] bg-[#0e0e11] p-4">
                <div className="skeleton h-3 w-24 mb-2" />
                <div className="skeleton h-3 w-48" />
              </div>
            ))}
          </div>
        ) : traces.length === 0 ? (
          <div className="rounded-xl border border-white/[0.04] border-dashed bg-[#0e0e11]/50 p-16 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
              <Activity className="w-5 h-5 text-zinc-700" />
            </div>
            <p className="text-sm text-zinc-600">
              No traces yet. Generate some content first.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {traces.map((trace) => {
              const color = AGENT_COLORS[trace.agentName] || "#71717a";
              const isExpanded = expanded === trace.id;

              return (
                <div
                  key={trace.id}
                  className="rounded-xl border border-white/[0.04] bg-[#0e0e11] overflow-hidden transition-all"
                  style={{ borderLeftColor: `${color}30`, borderLeftWidth: "2px" }}
                >
                  {/* Header */}
                  <button
                    className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-white/[0.01] transition-colors text-left"
                    onClick={() => setExpanded(isExpanded ? null : trace.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className="text-xs font-medium font-[var(--font-mono)]"
                        style={{ color }}
                      >
                        {trace.agentName}
                      </span>
                      <span className="text-[10px] text-zinc-700 font-[var(--font-mono)]">
                        {trace.model}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-[var(--font-mono)]">
                      <span>{trace.durationMs}ms</span>
                      {trace.tokens && (
                        <span>
                          {trace.tokens.prompt + trace.tokens.completion} tok
                        </span>
                      )}
                      <span className="hidden sm:inline text-zinc-700">
                        {new Date(trace.timestamp).toLocaleString()}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-700" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-700" />
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.04] p-4 space-y-3 animate-slide-up">
                      {trace.tokens && (
                        <div className="flex gap-3 text-[10px] font-[var(--font-mono)]">
                          <span className="text-zinc-600">
                            Prompt: <span className="text-zinc-400">{trace.tokens.prompt}</span>
                          </span>
                          <span className="text-zinc-600">
                            Completion: <span className="text-zinc-400">{trace.tokens.completion}</span>
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="text-[10px] text-zinc-600 uppercase mb-1.5 font-[var(--font-mono)]">
                          Input
                        </h4>
                        <pre className="text-[10px] text-zinc-500 bg-black/30 p-3 rounded-lg overflow-auto max-h-40 font-[var(--font-mono)] leading-relaxed">
                          {formatJson(trace.input)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-[10px] text-zinc-600 uppercase mb-1.5 font-[var(--font-mono)]">
                          Output
                        </h4>
                        <pre className="text-[10px] text-zinc-500 bg-black/30 p-3 rounded-lg overflow-auto max-h-40 font-[var(--font-mono)] leading-relaxed">
                          {formatJson(trace.output)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
