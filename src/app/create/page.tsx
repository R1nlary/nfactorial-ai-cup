"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ContentType = "tweet" | "thread" | "quote_retweet" | "article";
type StepStatus = "waiting" | "running" | "done" | "error";

interface PipelineStep {
  name: string;
  icon: string;
  status: StepStatus;
  output?: string;
}

const STEPS: PipelineStep[] = [
  { name: "Research", icon: "🔍", status: "waiting" },
  { name: "Outline", icon: "📋", status: "waiting" },
  { name: "Writer", icon: "✍️", status: "waiting" },
  { name: "Style", icon: "🎨", status: "waiting" },
  { name: "FactCheck", icon: "✅", status: "waiting" },
  { name: "Editor", icon: "📝", status: "waiting" },
];

export default function CreatePage() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<ContentType>("tweet");
  const [context, setContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>(STEPS);
  const [result, setResult] = useState<string | string[] | null>(null);
  const [traces, setTraces] = useState<unknown[]>([]);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setResult(null);
    setTraces([]);
    setSteps(STEPS.map((s) => ({ ...s, status: "waiting" as StepStatus })));

    try {
      setSteps((prev) =>
        prev.map((s, i) =>
          i === 0 ? { ...s, status: "running" as StepStatus } : s
        )
      );

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          type: contentType,
          context: context || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const data = await res.json();
      setResult(data.content || data.content?.finalContent || null);
      setTraces(data.traces || []);
      setSteps(STEPS.map((s) => ({ ...s, status: "done" as StepStatus })));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "running"
            ? { ...s, status: "error" as StepStatus, output: error.message }
            : s
        )
      );
    } finally {
      setGenerating(false);
    }
  }

  const statusDot: Record<StepStatus, string> = {
    waiting: "bg-zinc-700",
    running: "bg-violet-500 animate-pulse",
    done: "bg-emerald-500",
    error: "bg-red-500",
  };

  const resultText =
    typeof result === "string"
      ? result
      : Array.isArray(result)
        ? result.join("\n\n")
        : "";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Create
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Enter a topic, pick a format, let the agents work.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-2">
              Topic
            </label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to write about?"
              rows={3}
              className="bg-white/[0.02] border-white/[0.06] resize-none focus:border-violet-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-2">
              Format
            </label>
            <Select
              value={contentType}
              onValueChange={(v) => setContentType(v as ContentType)}
            >
              <SelectTrigger className="bg-white/[0.02] border-white/[0.06]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tweet">💬 Tweet</SelectItem>
                <SelectItem value="thread">🧵 Thread</SelectItem>
                <SelectItem value="quote_retweet">🔄 Quote Retweet</SelectItem>
                <SelectItem value="article">📄 Article</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-2">
              Extra context{" "}
              <span className="text-zinc-600">(optional)</span>
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Links, notes, angle preferences..."
              rows={2}
              className="bg-white/[0.02] border-white/[0.06] resize-none focus:border-violet-500/50"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 h-11 text-sm font-medium"
          >
            {generating ? "Generating..." : "Generate"}
          </Button>

          {/* Pipeline */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Pipeline
            </h3>
            <div className="space-y-2">
              {steps.map((step) => (
                <div
                  key={step.name}
                  className="flex items-center gap-3 py-1.5"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${statusDot[step.status]}`}
                  />
                  <span className="text-sm">{step.icon}</span>
                  <span className="text-xs text-zinc-400">{step.name}</span>
                  {step.status === "done" && (
                    <span className="text-[10px] text-emerald-500 ml-auto">
                      done
                    </span>
                  )}
                  {step.status === "error" && (
                    <span className="text-[10px] text-red-400 ml-auto">
                      {step.output}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-5">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Output
          </h3>
          {resultText ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="whitespace-pre-wrap text-sm leading-relaxed font-[var(--font-mono)]">
                {resultText}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-zinc-500 hover:text-white"
                  onClick={() => navigator.clipboard.writeText(resultText)}
                >
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-zinc-500 hover:text-white"
                  onClick={handleGenerate}
                >
                  Regenerate
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-12 text-center">
              <div className="text-zinc-700 text-4xl mb-3">✍️</div>
              <p className="text-sm text-zinc-600">
                {generating
                  ? "Agents are working..."
                  : "Enter a topic and click Generate"}
              </p>
            </div>
          )}

          {/* Traces */}
          {traces.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Traces ({traces.length})
              </h3>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 max-h-64 overflow-auto">
                <pre className="text-[10px] text-zinc-600 font-[var(--font-mono)]">
                  {JSON.stringify(traces, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
