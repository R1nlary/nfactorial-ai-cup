import { getOpenAI } from "@/lib/openai";
import type { AgentTraceData } from "@/lib/types";

export abstract class BaseAgent {
  abstract name: string;
  abstract systemPrompt: string;
  model: string = "gpt-4o";

  async run(input: unknown): Promise<{ output: unknown; trace: AgentTraceData }> {
    const start = Date.now();

    const response = await getOpenAI().chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: JSON.stringify(input) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const output = JSON.parse(content);

    const trace: AgentTraceData = {
      agentName: this.name,
      input,
      output,
      reasoning: null,
      model: this.model,
      tokens: {
        prompt: response.usage?.prompt_tokens ?? 0,
        completion: response.usage?.completion_tokens ?? 0,
      },
      durationMs: Date.now() - start,
    };

    return { output, trace };
  }
}
