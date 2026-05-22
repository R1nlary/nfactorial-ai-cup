"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Memory {
  id: string;
  key: string;
  value: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: "preference", label: "Preference" },
  { value: "style", label: "Writing Style" },
  { value: "topic", label: "Topic Interest" },
  { value: "feedback", label: "Feedback" },
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("preference");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, []);

  async function fetchMemories() {
    const res = await fetch("/api/memory");
    if (res.ok) {
      const data = await res.json();
      setMemories(data.memories || []);
    }
  }

  async function handleAdd() {
    if (!key.trim() || !value.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, category }),
      });
      if (res.ok) {
        setKey("");
        setValue("");
        fetchMemories();
        toast.success("Memory saved");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(key: string) {
    await fetch(`/api/memory?key=${encodeURIComponent(key)}`, { method: "DELETE" });
    fetchMemories();
    toast.success("Memory deleted");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-[#f5c518]" />
          <p className="font-[var(--font-mono)] text-[10px] tracking-widest text-[#f5c518] uppercase">
            Context Memory
          </p>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Memory</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Teach the agents your preferences. They'll use this context in every generation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0e0e11] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
            <Plus className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400">New Memory</span>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-[var(--font-mono)] block mb-1.5">
              Key
            </label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. preferred_tone, avoid_topics, target_audience"
              className="bg-black/30 border-white/[0.06] text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-[var(--font-mono)] block mb-1.5">
              Value
            </label>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="What should the agents remember?"
              rows={3}
              className="bg-black/30 border-white/[0.06] resize-none text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-[var(--font-mono)] block mb-1.5">
              Category
            </label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger className="bg-black/30 border-white/[0.06] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAdd}
            disabled={loading || !key.trim() || !value.trim()}
            className="w-full bg-white/[0.06] hover:bg-white/[0.1] text-white border-0"
          >
            Save Memory
          </Button>
        </div>

        {/* List */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-zinc-500 uppercase font-[var(--font-mono)]">
            Saved ({memories.length})
          </span>
          {memories.length === 0 ? (
            <div className="rounded-xl border border-white/[0.04] border-dashed p-8 text-center">
              <Brain className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">
                No memories yet. Add preferences to personalize content.
              </p>
            </div>
          ) : (
            memories.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-white/[0.06] bg-[#0e0e11] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-zinc-300 font-[var(--font-mono)]">
                        {m.key}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-600 uppercase font-[var(--font-mono)]">
                        {m.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {m.value}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(m.key)}
                    className="text-zinc-600 hover:text-red-400 h-7 w-7 p-0 shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
