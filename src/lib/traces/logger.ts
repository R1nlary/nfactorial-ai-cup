import { AgentTraceData } from "@/lib/types";

interface TraceEntry {
  agentName: string;
  input: unknown;
  output: unknown;
  reasoning: string | null;
  model: string;
  tokens: { prompt: number; completion: number };
  durationMs: number;
  timestamp: string;
}

const traceBuffer: TraceEntry[] = [];

export function logTrace(trace: AgentTraceData): void {
  traceBuffer.push({
    ...trace,
    timestamp: new Date().toISOString(),
  });
}

export function getTraces(): TraceEntry[] {
  return [...traceBuffer];
}

export function clearTraces(): void {
  traceBuffer.length = 0;
}

export function exportTraces(): string {
  return JSON.stringify(traceBuffer, null, 2);
}
