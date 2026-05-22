import type { AgentTraceData, ContentRequest, EditorOutput, DraftOutput, StyleReviewOutput, FactCheckOutput } from "@/lib/types";
import { ResearchAgent } from "./research";
import { OutlineAgent } from "./outline";
import { WriterAgent } from "./writer";
import { StyleReviewerAgent } from "./style-reviewer";
import { FactCheckerAgent } from "./fact-checker";
import { EditorAgent } from "./editor";
import { detectSlop, cleanSlop } from "@/lib/anti-slop";

export interface OrchestratorResult {
  content: EditorOutput;
  traces: AgentTraceData[];
  iterations: number;
}

const MAX_ITERATIONS = 2;
const SLOP_THRESHOLD = 30;
const NATURAL_SCORE_THRESHOLD = 7;

export async function runPipeline(
  request: ContentRequest,
  styleSamples?: string[],
): Promise<OrchestratorResult> {
  const traces: AgentTraceData[] = [];

  // 1. Research
  const researchAgent = new ResearchAgent();
  const researchResult = await researchAgent.run({
    topic: request.topic,
    sourceUrl: request.sourceUrl,
    context: request.context,
    contentType: request.type,
  });
  traces.push(researchResult.trace);

  // 2. Outline
  const outlineAgent = new OutlineAgent();
  const outlineResult = await outlineAgent.run({
    research: researchResult.output,
    contentType: request.type,
    style: request.context,
  });
  traces.push(outlineResult.trace);

  // Pick the recommended approach, or first one
  const approaches = outlineResult.output.approaches || outlineResult.output.angles || [];
  const bestAngle = approaches[outlineResult.output.recommendedApproach ?? 0] || approaches[0] || { hook: request.topic, structure: [request.topic] };

  // 3-5: Iterative Draft → Review cycle
  let iteration = 0;
  let currentDraft: DraftOutput | null = null;
  let lastStyleReview: StyleReviewOutput | null = null;
  let lastFactCheck: FactCheckOutput | null = null;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    // 3. Draft
    const writerAgent = new WriterAgent();
    const writerInput = iteration === 1
      ? { angle: bestAngle, research: researchResult.output, styleSamples, contentType: request.type }
      : { angle: bestAngle, research: researchResult.output, styleSamples, contentType: request.type, previousDraft: currentDraft, styleReview: lastStyleReview };

    const draftResult = await writerAgent.run(writerInput);
    traces.push(draftResult.trace);

    // Clean slop from draft before review
    const rawDraft = draftResult.output.draft;
    const cleanedDraft = Array.isArray(rawDraft)
      ? rawDraft.map((t) => cleanSlop(t))
      : cleanSlop(rawDraft);

    currentDraft = { ...draftResult.output, draft: cleanedDraft };

    // 4-5. Style Review + Fact Check in parallel
    const styleAgent = new StyleReviewerAgent();
    const factAgent = new FactCheckerAgent();

    const [styleResult, factResult] = await Promise.all([
      styleAgent.run({ draft: currentDraft.draft, styleSamples }),
      factAgent.run({ draft: currentDraft.draft }),
    ]);
    traces.push(styleResult.trace);
    traces.push(factResult.trace);

    lastStyleReview = styleResult.output;
    lastFactCheck = factResult.output;

    // Check quality — if good enough, stop iterating
    const slopCheck = detectSlop(
      Array.isArray(currentDraft.draft)
        ? currentDraft.draft.join(" ")
        : currentDraft.draft
    );

    const qualityOk =
      slopCheck.score <= SLOP_THRESHOLD &&
      lastStyleReview.naturalScore >= NATURAL_SCORE_THRESHOLD * 10;

    if (qualityOk || iteration >= MAX_ITERATIONS) break;
  }

  // 6. Edit — pass all review data
  const editorAgent = new EditorAgent();
  const slopResult = detectSlop(
    Array.isArray(currentDraft!.draft)
      ? currentDraft!.draft.join(" ")
      : currentDraft!.draft
  );

  const editorResult = await editorAgent.run({
    draft: currentDraft!,
    styleReview: lastStyleReview!,
    factCheck: lastFactCheck!,
    contentType: request.type,
    slopPhrases: slopResult.found,
    slopScore: slopResult.score,
  });
  traces.push(editorResult.trace);

  return {
    content: editorResult.output,
    traces,
    iterations: iteration,
  };
}
