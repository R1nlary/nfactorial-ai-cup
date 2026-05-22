"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  MessageSquare,
  AlignLeft,
  Quote,
  FileText,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Upload,
  X,
  Send,
  Brain,
} from "lucide-react";

type ContentType = "tweet" | "thread" | "quote_retweet" | "article";
type StepStatus = "waiting" | "running" | "done" | "error";

interface Step {
  name: string;
  status: StepStatus;
  output?: string;
  durationMs?: number;
}

const STEPS: Step[] = [
  { name: "Research", status: "waiting" },
  { name: "Outline", status: "waiting" },
  { name: "Writer", status: "waiting" },
  { name: "Style Review", status: "waiting" },
  { name: "Fact Check", status: "waiting" },
  { name: "Editor", status: "waiting" },
];

const STEP_COLORS: Record<string, string> = {
  Research: "#f5c518",
  Outline: "#ff6b35",
  Writer: "#e85d75",
  "Style Review": "#a78bfa",
  "Fact Check": "#34d399",
  Editor: "#60a5fa",
};

const FORMAT_OPTIONS: { value: ContentType; label: string; desc: string; icon: typeof MessageSquare }[] = [
  { value: "tweet", label: "Tweet", desc: "280 chars max", icon: MessageSquare },
  { value: "thread", label: "Thread", desc: "Multi-tweet arc", icon: AlignLeft },
  { value: "quote_retweet", label: "Quote RT", desc: "React to a tweet", icon: Quote },
  { value: "article", label: "Article", desc: "Long-form essay", icon: FileText },
];

export default function CreatePage() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<ContentType>("tweet");
  const [context, setContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<Step[]>(STEPS);
  const [result, setResult] = useState<string | string[] | null>(null);
  const [traces, setTraces] = useState<unknown[]>([]);
  const [showTraces, setShowTraces] = useState(false);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [topicError, setTopicError] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; filename: string }>>([]);
  const [distributionPlan, setDistributionPlan] = useState<Record<string, unknown> | null>(null);
  const [showDistribution, setShowDistribution] = useState(false);
  const [distributing, setDistributing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const topicParam = params.get("topic");
    if (type && ["tweet", "thread", "quote_retweet", "article"].includes(type)) {
      setContentType(type as ContentType);
    }
    if (topicParam) setTopic(topicParam);
  }, []);

  async function handleGenerate() {
    if (!topic.trim()) {
      setTopicError(true);
      toast.error("Enter a topic to generate content");
      return;
    }
    setTopicError(false);
    setGenerating(true);
    setResult(null);
    setTraces([]);
    setShowTraces(false);
    setTotalTime(0);
    setDistributionPlan(null);
    setShowDistribution(false);

    const freshSteps = STEPS.map((s) => ({ ...s, status: "waiting" as StepStatus }));
    setSteps(freshSteps);

    const startTime = Date.now();

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < STEPS.length) {
        setSteps((prev) =>
          prev.map((s, idx) => {
            if (idx === stepIndex) return { ...s, status: "running" as StepStatus };
            if (idx < stepIndex) return { ...s, status: "done" as StepStatus };
            return s;
          })
        );
        stepIndex++;
      }
    }, 1500);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          type: contentType,
          context: context || undefined,
          documentIds: uploadedFiles.map((f) => f.id),
        }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const data = await res.json();
      setResult(data.content || null);
      setTraces(data.traces || []);
      setTotalTime(Date.now() - startTime);
      setSteps(STEPS.map((s) => ({ ...s, status: "done" as StepStatus })));
    } catch (err) {
      clearInterval(stepInterval);
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "running" || s.status === "waiting"
            ? { ...s, status: "error" as StepStatus, output: error.message }
            : s
        )
      );
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(resultText);
    toast.success("Copied to clipboard");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          setUploadedFiles((prev) => [...prev, { id: data.id, filename: data.filename }]);
          toast.success(`Uploaded: ${data.filename}`);
        } else {
          toast.error(`Failed to upload: ${file.name}`);
        }
      } catch {
        toast.error(`Failed to upload: ${file.name}`);
      }
    }
    e.target.value = "";
  }

  function removeFile(id: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleDistribute() {
    if (!resultText || distributing) return;
    setDistributing(true);
    try {
      const res = await fetch("/api/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: resultText, contentType, topic }),
      });
      if (!res.ok) throw new Error("Distribution planning failed");
      const data = await res.json();
      setDistributionPlan(data.plan);
      setShowDistribution(true);
    } catch {
      toast.error("Distribution planning failed");
    } finally {
      setDistributing(false);
    }
  }

  const resultText =
    typeof result === "string"
      ? result
      : Array.isArray(result)
        ? result.join("\n\n")
        : "";

  const charCount = resultText.length;
  const isOverLimit = contentType === "tweet" && charCount > 280;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#f5c518]" />
          <p className="font-[var(--font-mono)] text-[10px] tracking-widest text-[#f5c518] uppercase">
            Content Generation
          </p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Create
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input — 2 cols */}
        <div className="lg:col-span-2 space-y-5 animate-fade-in-up animate-delay-1">
          {/* Topic */}
          <div>
            <label className="font-[var(--font-mono)] text-[10px] tracking-wider text-zinc-500 uppercase block mb-2">
              Topic <span className="text-[#f5c518]">*</span>
            </label>
            <Textarea
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (topicError) setTopicError(false);
              }}
              placeholder="What do you want to write about?"
              rows={3}
              className={`bg-[#0e0e11] border-white/[0.06] resize-none text-sm focus:border-[#f5c518]/30 focus:ring-0 transition-colors ${
                topicError ? "border-red-500/50" : ""
              }`}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-zinc-700">
                Be specific for better results
              </span>
              <span className="text-[10px] text-zinc-700 font-[var(--font-mono)]">
                {topic.length}
              </span>
            </div>
          </div>

          {/* Format — visual cards */}
          <div>
            <label className="font-[var(--font-mono)] text-[10px] tracking-wider text-zinc-500 uppercase block mb-2">
              Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FORMAT_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setContentType(value)}
                  className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all duration-200 ${
                    contentType === value
                      ? "border-[#f5c518]/30 bg-[#f5c518]/5"
                      : "border-white/[0.06] bg-[#0e0e11] hover:border-white/[0.1]"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                      contentType === value ? "text-[#f5c518]" : "text-zinc-600"
                    }`}
                  />
                  <div>
                    <span
                      className={`text-xs font-medium block ${
                        contentType === value ? "text-[#f5c518]" : "text-zinc-300"
                      }`}
                    >
                      {label}
                    </span>
                    <span className="text-[10px] text-zinc-600">{desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Context */}
          <div>
            <label className="font-[var(--font-mono)] text-[10px] tracking-wider text-zinc-500 uppercase block mb-2">
              Context <span className="text-zinc-700">(optional)</span>
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Links, notes, angle, or background info..."
              rows={2}
              className="bg-[#0e0e11] border-white/[0.06] resize-none text-sm focus:border-[#f5c518]/30 focus:ring-0"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="font-[var(--font-mono)] text-[10px] tracking-wider text-zinc-500 uppercase block mb-2">
              Documents <span className="text-zinc-700">(optional)</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-white/[0.08] bg-[#0e0e11] cursor-pointer hover:border-[#f5c518]/20 transition-colors">
              <Upload className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-xs text-zinc-600">Upload .txt, .md, .csv, .json</span>
              <input
                type="file"
                className="hidden"
                accept=".txt,.md,.csv,.json"
                multiple
                onChange={handleFileUpload}
              />
            </label>
            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {uploadedFiles.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.04]">
                    <FileText className="w-3 h-3 text-zinc-600 shrink-0" />
                    <span className="text-[11px] text-zinc-400 truncate flex-1">{f.filename}</span>
                    <button onClick={() => removeFile(f.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full h-11 rounded-lg bg-[#f5c518] text-[#08080a] text-sm font-semibold hover:bg-[#e8b800] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 glow-gold-sm hover:glow-gold"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </button>

          {/* Pipeline status */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <p className="font-[var(--font-mono)] text-[10px] tracking-widest text-zinc-600 uppercase">
                Pipeline
              </p>
              {totalTime > 0 && (
                <span className="text-[10px] text-zinc-700 font-[var(--font-mono)]">
                  {(totalTime / 1000).toFixed(1)}s
                </span>
              )}
            </div>
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-[7px] top-3 bottom-3 w-px bg-white/[0.04]" />

              <div className="space-y-0">
                {steps.map((step) => {
                  const color = STEP_COLORS[step.name] || "#71717a";
                  const isRunning = step.status === "running";
                  const isDone = step.status === "done";
                  const isError = step.status === "error";

                  return (
                    <div
                      key={step.name}
                      className="flex items-center gap-3 py-2 relative"
                    >
                      <div
                        className={`w-[15px] h-[15px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isRunning
                            ? "border-[var(--step-color)]"
                            : isDone
                              ? "border-[var(--step-color)] bg-[var(--step-color)]"
                              : isError
                                ? "border-red-500 bg-red-500"
                                : "border-white/[0.08]"
                        }`}
                        style={{ "--step-color": color } as React.CSSProperties}
                      >
                        {isRunning && (
                          <div
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: color }}
                          />
                        )}
                        {isDone && (
                          <svg className="w-2 h-2 text-[#08080a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-xs transition-colors duration-300 ${
                          isDone
                            ? "text-zinc-300"
                            : isRunning
                              ? "text-white font-medium"
                              : isError
                                ? "text-red-400"
                                : "text-zinc-700"
                        }`}
                      >
                        {step.name}
                      </span>
                      {isRunning && (
                        <div className="ml-auto">
                          <Loader2 className="w-3 h-3 animate-spin text-zinc-600" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Output — 3 cols */}
        <div className="lg:col-span-3 space-y-4 animate-fade-in-up animate-delay-2">
          <div className="flex items-center justify-between">
            <p className="font-[var(--font-mono)] text-[10px] tracking-widest text-zinc-600 uppercase">
              Output
            </p>
            {resultText && contentType === "tweet" && (
              <span
                className={`font-[var(--font-mono)] text-[10px] px-2 py-0.5 rounded-full ${
                  isOverLimit
                    ? "text-red-400 bg-red-500/10"
                    : "text-zinc-500 bg-white/[0.03]"
                }`}
              >
                {charCount}/280
              </span>
            )}
          </div>

          {resultText ? (
            <div className="rounded-xl border border-white/[0.06] bg-[#0e0e11] overflow-hidden animate-fade-in-up">
              {/* Content type badge */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase font-[var(--font-mono)]">
                    {contentType.replace("_", " ")}
                  </span>
                  {totalTime > 0 && (
                    <span className="text-[10px] text-zinc-700 font-[var(--font-mono)]">
                      {(totalTime / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] text-zinc-500 hover:text-[#f5c518] h-7 px-2"
                    onClick={handleDistribute}
                    disabled={distributing}
                  >
                    {distributing ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3 mr-1" />
                    )}
                    {distributing ? "Planning..." : "Distribute"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] text-zinc-500 hover:text-[#f5c518] h-7 px-2"
                    onClick={handleCopy}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] text-zinc-500 hover:text-[#f5c518] h-7 px-2"
                    onClick={handleGenerate}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {Array.isArray(result) ? (
                  <div className="space-y-3">
                    {result.map((tweet, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f5c518]/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-[#f5c518]">
                              {i + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {tweet}
                            </p>
                            <span className="text-[10px] text-zinc-700 font-[var(--font-mono)] mt-2 block">
                              {tweet.length}/280
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {resultText}
                  </div>
                )}
              </div>

              {/* Distribution panel */}
              {showDistribution && distributionPlan && (
                <div className="border-t border-white/[0.04] px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Send className="w-3 h-3 text-[#f5c518]" />
                    <span className="text-[10px] font-[var(--font-mono)] text-[#f5c518] uppercase tracking-wider font-medium">
                      Distribution Plan
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-zinc-600 block mb-0.5">Best time</span>
                      <span className="text-zinc-300">{String(distributionPlan.bestPostTime || "N/A")}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block mb-0.5">Format</span>
                      <span className="text-zinc-300">{String(distributionPlan.format || "single")}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block mb-0.5">Viral potential</span>
                      <span className="text-[#f5c518]">{String(distributionPlan.viralPotential || "?")}/10</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block mb-0.5">Follow-up</span>
                      <span className="text-zinc-300">{String(distributionPlan.followUpStrategy || "N/A").slice(0, 100)}</span>
                    </div>
                  </div>
                  {Array.isArray(distributionPlan.engagementHooks) && distributionPlan.engagementHooks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04]">
                      <span className="text-zinc-600 text-[10px] block mb-1">Engagement hooks</span>
                      <ul className="space-y-0.5">
                        {(distributionPlan.engagementHooks as string[]).map((h: string, i: number) => (
                          <li key={i} className="text-[11px] text-zinc-400">• {h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Traces toggle */}
              {traces.length > 0 && (
                <div className="border-t border-white/[0.04]">
                  <button
                    onClick={() => setShowTraces(!showTraces)}
                    className="flex items-center justify-between w-full px-5 py-3 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <span className="font-[var(--font-mono)]">
                      Agent Traces ({traces.length})
                    </span>
                    {showTraces ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {showTraces && (
                    <div className="px-5 pb-4 space-y-2 animate-slide-up">
                      {(traces as Array<{ agentName: string; model: string; durationMs: number; tokens?: { prompt: number; completion: number }; input: unknown; output: unknown }>).map(
                        (trace, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-white/[0.04] bg-black/20 p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="text-[10px] font-medium uppercase font-[var(--font-mono)]"
                                style={{
                                  color:
                                    STEP_COLORS[
                                      trace.agentName === "research"
                                        ? "Research"
                                        : trace.agentName === "writer"
                                          ? "Writer"
                                          : trace.agentName === "editor"
                                            ? "Editor"
                                            : trace.agentName === "style-reviewer"
                                              ? "Style Review"
                                              : trace.agentName === "fact-checker"
                                                ? "Fact Check"
                                                : trace.agentName === "outline"
                                                  ? "Outline"
                                                  : trace.agentName
                                    ] || "#71717a",
                                }}
                              >
                                {trace.agentName}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-700 font-[var(--font-mono)]">
                                <span>{trace.model}</span>
                                <span>{trace.durationMs}ms</span>
                                {trace.tokens && (
                                  <span>
                                    {trace.tokens.prompt + trace.tokens.completion} tok
                                  </span>
                                )}
                              </div>
                            </div>
                            <pre className="text-[10px] text-zinc-600 overflow-auto max-h-24 font-[var(--font-mono)] leading-relaxed">
                              {JSON.stringify(trace.output, null, 2)}
                            </pre>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.04] border-dashed bg-[#0e0e11]/50 p-12 text-center">
              {generating ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-3/4 mx-auto" />
                    <div className="skeleton h-4 w-full mx-auto" />
                    <div className="skeleton h-4 w-5/6 mx-auto" />
                    <div className="skeleton h-4 w-2/3 mx-auto" />
                  </div>
                  <p className="font-[var(--font-mono)] text-[11px] text-zinc-600">
                    agents working...
                  </p>
                </div>
              ) : (
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5 text-zinc-700" />
                  </div>
                  <p className="font-[var(--font-mono)] text-[11px] text-zinc-600">
                    Enter a topic and hit Generate
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
