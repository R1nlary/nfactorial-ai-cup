import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/openai", () => ({
  getOpenAI: vi.fn(),
}));

import { runPipeline } from "../orchestrator";
import { getOpenAI } from "@/lib/openai";
import type { ContentRequest } from "@/lib/types";

const mockCreate = vi.fn();

const MOCK_RESPONSES: Record<string, string> = {
  research: JSON.stringify({
    themes: ["AI agents", "automation"],
    dataPoints: ["42% of companies use AI"],
    angles: ["contrarian: AI agents are overhyped"],
    sources: ["McKinsey 2024 report"],
  }),
  outline: JSON.stringify({
    angles: [
      { hook: "Everyone is building AI agents. Most will fail.", points: ["Market saturation", "Quality gap"], cta: "Focus on outcomes, not agents.", score: 85 },
      { hook: "The quiet revolution in AI", points: ["Incremental wins"], cta: "Start small.", score: 70 },
    ],
  }),
  writer: JSON.stringify({
    draft: "Everyone is building AI agents. Most will fail. Here's what actually works: focus on outcomes, not tools.",
    wordCount: 18,
  }),
  "style-reviewer": JSON.stringify({
    slopScore: 90,
    voiceScore: 85,
    naturalScore: 80,
    edits: [],
  }),
  "fact-checker": JSON.stringify({
    claims: [{ text: "Most will fail", status: "unverified" }],
    overallScore: 70,
  }),
  editor: JSON.stringify({
    finalContent: "Everyone is building AI agents. Most will fail. Here's what works: focus on outcomes.",
    changes: ["Tightened closing sentence"],
  }),
};

beforeEach(() => {
  vi.restoreAllMocks();

  let callIndex = 0;
  const agentOrder = ["research", "outline", "writer", "style-reviewer", "fact-checker", "editor"];

  mockCreate.mockImplementation(() => {
    const agentName = agentOrder[callIndex % agentOrder.length];
    callIndex++;
    return Promise.resolve({
      choices: [{ message: { content: MOCK_RESPONSES[agentName] } }],
      usage: { prompt_tokens: 100, completion_tokens: 50 },
    });
  });

  (getOpenAI as ReturnType<typeof vi.fn>).mockReturnValue({
    chat: { completions: { create: mockCreate } },
  });
});

describe("runPipeline", () => {
  const request: ContentRequest = {
    topic: "AI agents in 2025",
    type: "tweet",
  };

  it("runs all 6 agents and returns traces for each", async () => {
    const result = await runPipeline(request);
    expect(result.traces.length).toBeGreaterThanOrEqual(6);

    const agentNames = result.traces.map((t) => t.agentName);
    expect(agentNames).toContain("research");
    expect(agentNames).toContain("outline");
    expect(agentNames).toContain("writer");
    expect(agentNames).toContain("style-reviewer");
    expect(agentNames).toContain("fact-checker");
    expect(agentNames).toContain("editor");
  });

  it("returns final content from editor", async () => {
    const result = await runPipeline(request);
    expect(result.content.finalContent).toBeTruthy();
    expect(typeof result.content.finalContent).toBe("string");
  });

  it("tracks iteration count", async () => {
    const result = await runPipeline(request);
    expect(result.iterations).toBeGreaterThanOrEqual(1);
    expect(result.iterations).toBeLessThanOrEqual(2);
  });

  it("passes style samples through the pipeline", async () => {
    const samples = ["Write like this.", "And like this."];
    await runPipeline(request, samples);

    const writerCall = mockCreate.mock.calls.find((call) => {
      const content = call[0].messages[1].content;
      return content.includes("styleSamples");
    });
    expect(writerCall).toBeTruthy();
  });

  it("calls OpenAI at least 6 times for full pipeline", async () => {
    mockCreate.mockClear();
    await runPipeline(request);
    expect(mockCreate.mock.calls.length).toBeGreaterThanOrEqual(6);
  });
});
