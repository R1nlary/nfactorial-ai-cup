import { BaseAgent } from "./base-agent";
import type { ResearchOutput, ContentType, OutlineOutput } from "@/lib/types";

const OUTLINE_SYSTEM_PROMPT = `You are a content strategist who creates compelling content outlines.

Given research data, content type, and style guidance, generate multiple angles with hooks, key points, and calls to action.
Score each angle 0-100 based on potential engagement and originality.

Output JSON:
{
  "angles": [
    {
      "hook": "attention-grabbing first line",
      "points": ["key point 1", "key point 2", ...],
      "cta": "call to action or closing thought",
      "score": 0-100
    }
  ]
}`;

export class OutlineAgent extends BaseAgent {
  name = "outline";
  systemPrompt = OUTLINE_SYSTEM_PROMPT;

  async run(input: { research: ResearchOutput; contentType: ContentType; style?: string }) {
    return super.run(input) as Promise<{ output: OutlineOutput; trace: import("@/lib/types").AgentTraceData }>;
  }
}
