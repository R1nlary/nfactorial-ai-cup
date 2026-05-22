"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
  researcher: "text-violet-400",
  writer: "text-fuchsia-400",
  editor: "text-emerald-400",
  "style-reviewer": "text-amber-400",
  "fact-checker": "text-sky-400",
  outline: "text-orange-400",
};

export default function TracesPage() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchTraces();
  }, []);

  async function fetchTraces() {
    const res = await fetch("/api/traces");
    if (res.ok) {
      const data = await res.json();
      setTraces(data.traces || []);
    }
  }

  async function handleExport() {
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
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Agent Traces
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Full execution log of every agent call
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-zinc-500 hover:text-white"
          onClick={handleExport}
        >
          Export JSON
        </Button>
      </div>

      {traces.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-16 text-center">
          <div className="text-zinc-700 text-4xl mb-3">📋</div>
          <p className="text-sm text-zinc-600">
            No traces yet. Generate some content first.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {traces.map((trace) => (
            <div
              key={trace.id}
              className="rounded-lg border border-white/[0.04] bg-white/[0.01] overflow-hidden"
            >
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() =>
                  setExpanded(expanded === trace.id ? null : trace.id)
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium ${AGENT_COLORS[trace.agentName] || "text-zinc-400"}`}
                  >
                    {trace.agentName}
                  </span>
                  <span className="text-[10px] text-zinc-700">
                    {trace.model}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                  <span>{trace.durationMs}ms</span>
                  {trace.tokens && (
                    <span>
                      {trace.tokens.prompt + trace.tokens.completion} tok
                    </span>
                  )}
                  <span className="hidden sm:inline">
                    {new Date(trace.timestamp).toLocaleString()}
                  </span>
                  <span className="text-zinc-700">
                    {expanded === trace.id ? "▾" : "▸"}
                  </span>
                </div>
              </div>

              {expanded === trace.id && (
                <div className="border-t border-white/[0.04] p-4 space-y-3">
                  <div>
                    <h4 className="text-[10px] text-zinc-600 uppercase mb-1">
                      Input
                    </h4>
                    <pre className="text-[10px] text-zinc-500 bg-black/30 p-3 rounded-lg overflow-auto max-h-32 font-[var(--font-mono)]">
                      {JSON.stringify(trace.input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-zinc-600 uppercase mb-1">
                      Output
                    </h4>
                    <pre className="text-[10px] text-zinc-500 bg-black/30 p-3 rounded-lg overflow-auto max-h-32 font-[var(--font-mono)]">
                      {JSON.stringify(trace.output, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
