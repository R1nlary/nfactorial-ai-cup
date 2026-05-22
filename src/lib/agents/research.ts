import { BaseAgent } from "./base-agent";
import type { ResearchOutput } from "@/lib/types";
import { RESEARCH_SYSTEM_PROMPT } from "@/lib/prompts/research";

export class ResearchAgent extends BaseAgent {
  name = "research";
  systemPrompt = RESEARCH_SYSTEM_PROMPT;

  async run(input: { topic?: string; sourceUrl?: string }) {
    return super.run(input) as Promise<{ output: ResearchOutput; trace: import("@/lib/types").AgentTraceData }>;
  }
}
