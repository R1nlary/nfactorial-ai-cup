"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ContentType = "tweet" | "thread" | "quote_retweet" | "article";
type StepStatus = "waiting" | "running" | "done" | "error";

interface PipelineStep {
  name: string;
  status: StepStatus;
  output?: string;
}

const STEPS = [
  "Research",
  "Outline",
  "Draft Writer",
  "Style Review",
  "Fact Check",
  "Editor",
];

export default function CreatePage() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<ContentType>("tweet");
  const [context, setContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>(
    STEPS.map((name) => ({ name, status: "waiting" as StepStatus }))
  );
  const [result, setResult] = useState<string | null>(null);
  const [traces, setTraces] = useState<unknown[]>([]);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setResult(null);
    setTraces([]);
    setSteps(STEPS.map((name) => ({ name, status: "waiting" as StepStatus })));

    try {
      // Simulate pipeline steps via streaming
      for (let i = 0; i < STEPS.length; i++) {
        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "running" as StepStatus } : s
          )
        );
      }

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
      setResult(data.content?.finalContent || data.content?.drafts?.[0] || "No output");
      setTraces(data.traces || []);

      setSteps(
        STEPS.map((name) => ({ name, status: "done" as StepStatus }))
      );
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

  const statusColor: Record<StepStatus, string> = {
    waiting: "bg-zinc-700",
    running: "bg-blue-600 animate-pulse",
    done: "bg-green-600",
    error: "bg-red-600",
  };

  return (
    <div className="p-8 max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">Create Content</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Topic</label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to write about?"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Type</label>
            <Select
              value={contentType}
              onValueChange={(v) => setContentType(v as ContentType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tweet">Tweet</SelectItem>
                <SelectItem value="thread">Thread</SelectItem>
                <SelectItem value="quote_retweet">Quote Retweet</SelectItem>
                <SelectItem value="article">Article</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">
              Additional Context (optional)
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Any extra context, links, or notes..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="w-full"
            size="lg"
          >
            {generating ? "Generating..." : "Generate"}
          </Button>

          {/* Pipeline Status */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400">Pipeline</h3>
            {steps.map((step) => (
              <div key={step.name} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${statusColor[step.status]}`} />
                <span className="text-sm">{step.name}</span>
                {step.status === "done" && (
                  <Badge variant="secondary" className="text-xs">
                    ✓
                  </Badge>
                )}
                {step.status === "error" && (
                  <span className="text-xs text-red-400">{step.output}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Output</h3>
          {result ? (
            <Card className="p-4 border-zinc-800">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {result}
              </div>
              <Separator className="my-3 bg-zinc-800" />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(result)}
                >
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  Regenerate
                </Button>
              </div>
            </Card>
          ) : (
            <div className="border border-zinc-800 rounded-lg p-8 text-center text-zinc-600">
              {generating
                ? "Agents are working..."
                : "Enter a topic and click Generate"}
            </div>
          )}

          {/* Traces */}
          {traces.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">
                Agent Traces ({traces.length})
              </h3>
              <Card className="p-4 border-zinc-800">
                <pre className="text-xs text-zinc-500 overflow-auto max-h-64">
                  {JSON.stringify(traces, null, 2)}
                </pre>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
