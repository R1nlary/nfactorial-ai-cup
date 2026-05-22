"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      setProfiles(data.profiles || []);
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
        fetchProfiles();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/style/${id}`, { method: "DELETE" });
    if (res.ok) fetchProfiles();
  }

  return (
    <div className="p-8 max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">Style Profiles</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Create */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">
            Create New Profile
          </h3>
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Paul Graham style"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">
              Description (optional)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">
              Writing Samples (separate with --- )
            </label>
            <Textarea
              value={samples}
              onChange={(e) => setSamples(e.target.value)}
              placeholder="Paste writing samples here...&#10;---&#10;Separate multiple samples with ---"
              rows={8}
            />
          </div>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            Create Profile
          </Button>
        </div>

        {/* Existing */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">
            Existing Profiles
          </h3>
          {profiles.length === 0 ? (
            <div className="text-zinc-600 text-sm">
              No profiles yet. Create one above.
            </div>
          ) : (
            profiles.map((p) => (
              <Card key={p.id} className="p-4 border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{p.name}</h4>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {p.samples.length} samples
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(p.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {p.description && (
                  <p className="text-sm text-zinc-500">{p.description}</p>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
