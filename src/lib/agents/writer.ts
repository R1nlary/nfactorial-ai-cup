import { BaseAgent } from "./base-agent";
import type { ResearchOutput, OutlineOutput, DraftOutput } from "@/lib/types";
import { WRITER_SYSTEM_PROMPT } from "@/lib/prompts/writer";

export class WriterAgent extends BaseAgent {
  name = "writer";
  systemPrompt = WRITER_SYSTEM_PROMPT;

  async run(input: {
    angle: Record<string, any>;
    research: ResearchOutput;
    styleSamples?: string[];
    contentType: string;
    previousDraft?: unknown;
    styleReview?: unknown;
  }) {
    return super.run(input) as Promise<{ output: DraftOutput; trace: import("@/lib/types").AgentTraceData }>;
  }
}
