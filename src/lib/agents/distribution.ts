import { BaseAgent } from "./base-agent";

const DISTRIBUTION_PROMPT = `You are a content distribution strategist for X/Twitter.

Given a piece of content and context, create an optimal posting strategy.

## YOUR JOB
1. Determine the best time to post (based on engagement patterns)
2. Suggest posting format (single tweet, thread with delay between tweets, etc.)
3. Recommend hashtags (max 2, only if genuinely useful)
4. Suggest a follow-up strategy (quote retweet yourself? reply with context?)
5. Rate the viral potential and explain why

## POSTING TIMING
- Best engagement: Tue-Thu, 9-11am or 2-4pm in target timezone
- Avoid: Mon morning, Fri afternoon, weekends
- For threads: post first tweet at peak, add replies every 2-3 minutes

## OUTPUT
JSON:
{
  "bestPostTime": "suggested day and time",
  "format": "single | thread-delayed | thread-immediate",
  "recommendedHashtags": ["max 2"],
  "followUpStrategy": "what to do after posting",
  "viralPotential": 1-10,
  "viralReasoning": "why this score",
  "crossPostSuggestions": ["LinkedIn adaptation", "newsletter mention"],
  "engagementHooks": ["reply bait", "controversial take to boost replies"]
}`;

export class DistributionAgent extends BaseAgent {
  name = "distribution";
  systemPrompt = DISTRIBUTION_PROMPT;

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
