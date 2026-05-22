export type ContentType = "tweet" | "thread" | "quote_retweet" | "article";

export interface ContentRequest {
  topic: string;
  type: ContentType;
  styleProfileId?: string;
  context?: string;
  sourceUrl?: string;
}

export interface AgentInput {
  [key: string]: unknown;
}

export interface AgentOutput {
  [key: string]: unknown;
}

export interface AgentTraceData {
  agentName: string;
  input: unknown;
  output: unknown;
  reasoning: string | null;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
  };
  durationMs: number;
}

export interface GenerationResult {
  content: unknown;
  traces: AgentTraceData[];
}

export interface DiscoveryResult {
  items: DiscoveredItem[];
}

export interface DiscoveredItem {
  source: string;
  title: string;
  url: string;
  summary?: string;
  score?: number;
  tags?: string[];
}

export interface ResearchOutput {
  contrarianTake?: string;
  dataPoints: string[];
  angles: string[];
  potentialHooks?: string[];
  keyInsight?: string;
  // Legacy fields
  themes?: string[];
  sources?: string[];
}

export interface OutlineAngle {
  hook: string;
  points: string[];
  cta: string;
  score: number;
}

export interface OutlineApproach {
  angle: string;
  hook: string;
  structure: string[];
  tone: string;
  whyItWorks: string;
}

export interface OutlineOutput {
  approaches: OutlineApproach[];
  recommendedApproach: number;
  keyMetaphorOrFrame?: string;
  // Legacy support
  angles?: OutlineAngle[];
}

export interface DraftOutput {
  draft: string | string[];
  wordCount: number;
}

export interface StyleReviewEdit {
  line: string;
  issue: string;
  fix: string;
}

export interface StyleReviewOutput {
  slopScore: number;
  voiceScore: number;
  naturalScore: number;
  edits: StyleReviewEdit[];
}

export interface FactCheckClaim {
  text: string;
  status: "verified" | "unverified" | "false";
  source?: string;
  correction?: string;
}

export interface FactCheckOutput {
  claims: FactCheckClaim[];
  overallScore: number;
}

export interface EditorOutput {
  finalContent: string | string[];
  content?: string | string[];
  charCount?: number;
  editsMade?: string[];
  changes: string[];
}
