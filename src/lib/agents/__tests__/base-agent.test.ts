import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/openai", () => ({
  getOpenAI: vi.fn(),
}));

import { BaseAgent } from "../base-agent";
import { getOpenAI } from "@/lib/openai";

class TestAgent extends BaseAgent {
  name = "test-agent";
  systemPrompt = "You are a test agent.";
}

const mockCreate = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  (getOpenAI as ReturnType<typeof vi.fn>).mockReturnValue({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  });
});

describe("BaseAgent", () => {
  it("sends correct message format to OpenAI", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{"result": "ok"}' } }],
      usage: { prompt_tokens: 10, completion_tokens: 5 },
    });

    const agent = new TestAgent();
    await agent.run({ topic: "test" });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a test agent." },
          { role: "user", content: '{"topic":"test"}' },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      })
    );
  });

  it("returns parsed output and trace data", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{"answer": 42}' } }],
      usage: { prompt_tokens: 100, completion_tokens: 50 },
    });

    const agent = new TestAgent();
    const { output, trace } = await agent.run("test input");

    expect(output).toEqual({ answer: 42 });
    expect(trace.agentName).toBe("test-agent");
    expect(trace.model).toBe("gpt-4o");
    expect(trace.tokens.prompt).toBe(100);
    expect(trace.tokens.completion).toBe(50);
    expect(trace.durationMs).toBeGreaterThanOrEqual(0);
    expect(trace.input).toBe("test input");
  });

  it("handles missing usage data gracefully", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{}' } }],
      usage: undefined,
    });

    const agent = new TestAgent();
    const { trace } = await agent.run({});

    expect(trace.tokens.prompt).toBe(0);
    expect(trace.tokens.completion).toBe(0);
  });

  it("throws on invalid JSON response", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "not json" } }],
      usage: { prompt_tokens: 10, completion_tokens: 5 },
    });

    const agent = new TestAgent();
    await expect(agent.run({})).rejects.toThrow();
  });

  it("allows subclasses to override model", async () => {
    class MiniAgent extends BaseAgent {
      name = "mini";
      systemPrompt = "Mini agent.";
      model = "gpt-4o-mini";
    }

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{}' } }],
      usage: { prompt_tokens: 5, completion_tokens: 3 },
    });

    const agent = new MiniAgent();
    await agent.run({});

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gpt-4o-mini" })
    );
  });
});
