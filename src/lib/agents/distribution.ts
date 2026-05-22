import { BaseAgent } from "./base-agent";
import { DISTRIBUTION_SYSTEM_PROMPT } from "@/lib/prompts/distribution";

export class DistributionAgent extends BaseAgent {
  name = "distribution";
  systemPrompt = DISTRIBUTION_SYSTEM_PROMPT;

  async run(input: { content: string; contentType: string; topic: string }) {
    return super.run(input) as Promise<{
      output: {
        bestPostTime: string;
        format: string;
        recommendedHashtags: string[];
        followUpStrategy: string;
        viralPotential: number;
        viralReasoning: string;
        crossPostSuggestions: string[];
        engagementHooks: string[];
      };
      trace: import("@/lib/types").AgentTraceData;
    }>;
  }
}
