"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Agent Traces</h2>
        <Button variant="outline" onClick={handleExport}>
          Export JSON
        </Button>
      </div>

      {traces.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No traces yet. Generate some content first.
        </div>
      ) : (
        <div className="space-y-3">
          {traces.map((trace) => (
            <Card key={trace.id} className="p-4 border-zinc-800">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpanded(expanded === trace.id ? null : trace.id)
                }
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{trace.agentName}</Badge>
                  <span className="text-sm text-zinc-400">
                    {trace.model}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>{trace.durationMs}ms</span>
                  {trace.tokens && (
                    <span>
                      {trace.tokens.prompt + trace.tokens.completion} tokens
                    </span>
                  )}
                  <span>{new Date(trace.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {expanded === trace.id && (
                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-zinc-400 mb-1">
                      Input
                    </h4>
                    <pre className="text-xs bg-zinc-900 p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(trace.input, null, 2)}
                    </pre>
                  </div>
                  {trace.reasoning && (
                    <div>
                      <h4 className="text-xs font-medium text-zinc-400 mb-1">
                        Reasoning
                      </h4>
                      <pre className="text-xs bg-zinc-900 p-3 rounded overflow-auto max-h-40">
                        {trace.reasoning}
                      </pre>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-medium text-zinc-400 mb-1">
                      Output
                    </h4>
                    <pre className="text-xs bg-zinc-900 p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(trace.output, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
