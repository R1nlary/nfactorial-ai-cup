import { BaseAgent } from "./base-agent";
import type { EditorOutput, DraftOutput, StyleReviewOutput, FactCheckOutput } from "@/lib/types";
import { EDITOR_SYSTEM_PROMPT } from "@/lib/prompts/editor";

export class EditorAgent extends BaseAgent {
  name = "editor";
  systemPrompt = EDITOR_SYSTEM_PROMPT;

  async run(input: {
    draft: DraftOutput;
    styleReview: StyleReviewOutput;
    factCheck: FactCheckOutput;
    contentType: string;
  }) {
    return super.run(input) as Promise<{ output: EditorOutput; trace: import("@/lib/types").AgentTraceData }>;
  }
}
