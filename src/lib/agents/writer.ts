import { BaseAgent } from "./base-agent";
import type { ResearchOutput, OutlineOutput, DraftOutput } from "@/lib/types";
import { WRITER_SYSTEM_PROMPT } from "@/lib/prompts/writer";

export class WriterAgent extends BaseAgent {
  name = "writer";
  systemPrompt = WRITER_SYSTEM_PROMPT;

  async run(input: {
    angle: OutlineOutput["angles"][number];
    research: ResearchOutput;
    styleSamples?: string[];
    contentType: string;
  }) {
    return super.run(input) as Promise<{ output: DraftOutput; trace: import("@/lib/types").AgentTraceData }>;
  }
}
