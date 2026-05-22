"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    const res = await fetch("/api/style");
    if (res.ok) {
      const data = await res.json();
      setProfiles(data.profiles || data || []);
    }
  }

  async function handleCreate() {
    if (!name.trim() || !samples.trim()) return;
    setLoading(true);
    try {
      const sampleList = samples
        .split("\n---\n")
        .map((s) => s.trim())
        .filter(Boolean);

      await fetch("/api/style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          samples: sampleList,
          description: description || undefined,
        }),
      });

      setName("");
      setDescription("");
      setSamples("");
      fetchProfiles();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/style/${id}`, { method: "DELETE" });
    fetchProfiles();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Style Profiles
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Teach the agents your voice with writing samples
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-5 space-y-4">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            New Profile
          </h3>
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Paul Graham style"
              className="bg-white/[0.02] border-white/[0.06]"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">
              Description <span className="text-zinc-600">(optional)</span>
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              className="bg-white/[0.02] border-white/[0.06]"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">
              Writing samples{" "}
              <span className="text-zinc-600">(separate with ---)</span>
            </label>
            <Textarea
              value={samples}
              onChange={(e) => setSamples(e.target.value)}
              placeholder="Paste your writing here..."
              rows={6}
              className="bg-white/[0.02] border-white/[0.06] resize-none"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="w-full bg-white/[0.06] hover:bg-white/[0.1] text-white border-0"
          >
            Create Profile
          </Button>
        </div>

        {/* Existing */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Saved Profiles
          </h3>
          {profiles.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-8 text-center">
              <p className="text-sm text-zinc-600">
                No profiles yet. Create one to get started.
              </p>
            </div>
          ) : (
            profiles.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{p.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600">
                      {Array.isArray(p.samples) ? p.samples.length : 0} samples
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(p.id)}
                      className="text-[10px] text-red-500/60 hover:text-red-400 h-6"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {p.description && (
                  <p className="text-xs text-zinc-600">{p.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
