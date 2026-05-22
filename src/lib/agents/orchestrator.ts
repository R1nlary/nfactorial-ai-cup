import type { AgentTraceData, ContentRequest, EditorOutput } from "@/lib/types";
import { ResearchAgent } from "./research";
import { OutlineAgent } from "./outline";
import { WriterAgent } from "./writer";
import { StyleReviewerAgent } from "./style-reviewer";
import { FactCheckerAgent } from "./fact-checker";
import { EditorAgent } from "./editor";

export interface OrchestratorResult {
  content: EditorOutput;
  traces: AgentTraceData[];
}

export async function runPipeline(request: ContentRequest): Promise<OrchestratorResult> {
  const traces: AgentTraceData[] = [];

  // 1. Research
  const researchAgent = new ResearchAgent();
  const researchResult = await researchAgent.run({
    topic: request.topic,
    sourceUrl: request.sourceUrl,
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

  // Pick best angle
  const bestAngle = outlineResult.output.angles.reduce((best, angle) =>
    angle.score > best.score ? angle : best
  );

  // 3. Draft
  const writerAgent = new WriterAgent();
  const draftResult = await writerAgent.run({
    angle: bestAngle,
    research: researchResult.output,
    contentType: request.type,
  });
  traces.push(draftResult.trace);

  // 4. Style Review (lighter model)
  const styleAgent = new StyleReviewerAgent();
  const styleResult = await styleAgent.run({ draft: draftResult.output.draft });
  traces.push(styleResult.trace);

  // 5. Fact Check (lighter model)
  const factAgent = new FactCheckerAgent();
  const factResult = await factAgent.run({ draft: draftResult.output.draft });
  traces.push(factResult.trace);

  // 6. Edit
  const editorAgent = new EditorAgent();
  const editorResult = await editorAgent.run({
    draft: draftResult.output,
    styleReview: styleResult.output,
    factCheck: factResult.output,
    contentType: request.type,
  });
  traces.push(editorResult.trace);

  return {
    content: editorResult.output,
    traces,
  };
}
