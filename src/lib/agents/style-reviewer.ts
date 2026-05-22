import { BaseAgent } from "./base-agent";
import type { StyleReviewOutput } from "@/lib/types";
import { STYLE_REVIEWER_SYSTEM_PROMPT } from "@/lib/prompts/style-reviewer";

export class StyleReviewerAgent extends BaseAgent {
  name = "style-reviewer";
  systemPrompt = STYLE_REVIEWER_SYSTEM_PROMPT;
  model = "gpt-4o-mini";

  async run(input: { draft: string | string[]; styleSamples?: string[] }) {
    return super.run(input) as Promise<{ output: StyleReviewOutput; trace: import("@/lib/types").AgentTraceData }>;
  }
}
