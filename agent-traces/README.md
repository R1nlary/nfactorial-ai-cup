# Agent Traces

This directory contains exported agent traces for submission.

Traces are logged automatically during content generation and can be exported from the Traces page in the UI or via the `/api/traces?export=true` endpoint.

## Format

Each trace includes:
- `agentName` — which agent ran
- `input` — what the agent received
- `output` — what the agent produced
- `reasoning` — chain of thought (if applicable)
- `model` — which AI model was used
- `tokens` — prompt and completion token counts
- `durationMs` — execution time in milliseconds
- `timestamp` — when the agent ran
