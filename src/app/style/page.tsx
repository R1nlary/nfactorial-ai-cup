"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Palette, Trash2, FileText, Plus } from "lucide-react";

interface StyleProfile {
  id: string;
  name: string;
  samples: string[];
  description?: string;
}

export default function StylePage() {
  const [profiles, setProfiles] = useState<StyleProfile[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [samples, setSamples] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    try {
      const res = await fetch("/api/style");
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || data || []);
      }
    } catch {
      toast.error("Failed to load profiles");
    }
  }

  async function handleCreate() {
    if (!name.trim() || !samples.trim()) {
      toast.error("Name and samples are required");
      return;
    }
    setLoading(true);
    try {
      const sampleList = samples
        .split("\n---\n")
        .map((s) => s.trim())
        .filter(Boolean);

      if (sampleList.length < 2) {
        toast.error("Add at least 2 writing samples separated by ---");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          samples: sampleList,
          description: description || undefined,
        }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        setSamples("");
        toast.success("Style profile created");
        fetchProfiles();
      } else {
        toast.error("Failed to create profile");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/style/${id}`, { method: "DELETE" });
      toast.success("Profile deleted");
      fetchProfiles();
    } catch {
      toast.error("Failed to delete profile");
    }
  }

  const sampleCount = samples
    .split("\n---\n")
    .map((s) => s.trim())
    .filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-4 h-4 text-[#f5c518]" />
          <p className="font-[var(--font-mono)] text-[10px] tracking-widest text-[#f5c518] uppercase">
            Voice Configuration
          </p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Style Profiles
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Teach the agents your voice with writing samples
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create form */}
        <div className="animate-fade-in-up animate-delay-1">
          <div className="rounded-xl border border-white/[0.06] bg-[#0e0e11] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04] flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-zinc-500" />
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider font-[var(--font-mono)]">
                New Profile
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1.5 uppercase tracking-wider font-[var(--font-mono)]">
                  Name <span className="text-[#f5c518]">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Paul Graham style"
                  className="bg-white/[0.02] border-white/[0.06] text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 block mb-1.5 uppercase tracking-wider font-[var(--font-mono)]">
                  Description <span className="text-zinc-700">(optional)</span>
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this writing style"
                  className="bg-white/[0.02] border-white/[0.06] text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-[var(--font-mono)]">
                    Writing Samples <span className="text-[#f5c518]">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-700 font-[var(--font-mono)]">
                    {sampleCount} sample{sampleCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <Textarea
                  value={samples}
                  onChange={(e) => setSamples(e.target.value)}
                  placeholder={"Paste your writing here...\n\n---\n\nSecond sample here...\n\n---\n\nThird sample here..."}
                  rows={8}
                  className="bg-white/[0.02] border-white/[0.06] resize-none text-sm font-[var(--font-mono)] text-xs leading-relaxed"
                />
                <p className="text-[10px] text-zinc-700 mt-1.5">
                  Separate samples with <code className="text-[#f5c518]/60 bg-[#f5c518]/5 px-1 rounded">---</code> on its own line. More samples = better matching.
                </p>
              </div>

              <Button
                onClick={handleCreate}
                disabled={loading || !name.trim() || sampleCount < 2}
                className="w-full bg-[#f5c518] text-[#08080a] hover:bg-[#e8b800] font-semibold disabled:opacity-30"
              >
                {loading ? "Creating..." : "Create Profile"}
              </Button>
            </div>
          </div>
        </div>

        {/* Existing profiles */}
        <div className="animate-fade-in-up animate-delay-2">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider font-[var(--font-mono)]">
              Saved Profiles
            </h3>
            <span className="text-[10px] text-zinc-700 font-[var(--font-mono)]">
              ({profiles.length})
            </span>
          </div>

          {profiles.length === 0 ? (
            <div className="rounded-xl border border-white/[0.04] border-dashed bg-[#0e0e11]/50 p-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-zinc-700" />
              </div>
              <p className="text-sm text-zinc-600">
                No profiles yet. Create one to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((p) => {
                const samplePreview = Array.isArray(p.samples) && p.samples[0]
                  ? p.samples[0].slice(0, 80) + (p.samples[0].length > 80 ? "..." : "")
                  : null;

                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-white/[0.06] bg-[#0e0e11] p-4 card-hover transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#a78bfa]/10 flex items-center justify-center">
                          <Palette className="w-3.5 h-3.5 text-[#a78bfa]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{p.name}</h4>
                          <span className="text-[10px] text-zinc-600 font-[var(--font-mono)]">
                            {Array.isArray(p.samples) ? p.samples.length : 0} samples
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(p.id)}
                        className="text-zinc-700 hover:text-red-400 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    {p.description && (
                      <p className="text-xs text-zinc-500 mb-2">{p.description}</p>
                    )}
                    {samplePreview && (
                      <p className="text-[11px] text-zinc-700 italic leading-relaxed border-l-2 border-white/[0.06] pl-3">
                        &ldquo;{samplePreview}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
