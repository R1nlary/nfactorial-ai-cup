import { BaseAgent } from "./base-agent";
import type { FactCheckOutput } from "@/lib/types";
import { FACT_CHECKER_SYSTEM_PROMPT } from "@/lib/prompts/fact-checker";

export class FactCheckerAgent extends BaseAgent {
  name = "fact-checker";
  systemPrompt = FACT_CHECKER_SYSTEM_PROMPT;
  model = "gpt-4o-mini";

  async run(input: { draft: string | string[] }) {
    return super.run(input) as Promise<{ output: FactCheckOutput; trace: import("@/lib/types").AgentTraceData }>;
  }
}
