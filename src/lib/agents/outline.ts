import { BaseAgent } from "./base-agent";
import type { ResearchOutput, ContentType, OutlineOutput } from "@/lib/types";
import { OUTLINE_SYSTEM_PROMPT } from "@/lib/prompts/outline";

export class OutlineAgent extends BaseAgent {
  name = "outline";
  systemPrompt = OUTLINE_SYSTEM_PROMPT;

  async run(input: { research: ResearchOutput; contentType: ContentType; style?: string }) {
    return super.run(input) as Promise<{ output: OutlineOutput; trace: import("@/lib/types").AgentTraceData }>;
  }
}
