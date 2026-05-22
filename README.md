# AI Cup — Twitter Content Generator

Multi-agent AI system for generating high-quality X/Twitter content. Built for nFactorial's Agentic AI Engineer hiring test.

## What it does

This system generates smart, insightful, nuanced content for X/Twitter — not generic AI slop. It uses a pipeline of specialized agents:

1. **Research Agent** — discovers themes, data points, and contrarian angles
2. **Outline Agent** — generates multiple angles with hooks and structure
3. **Draft Writer** — writes content matching your voice and style
4. **Style Reviewer** — detects AI patterns and ensures natural writing
5. **Fact Checker** — verifies claims and suggests corrections
6. **Editor** — polishes hooks, tightens prose, final output

## Architecture

```
Frontend (Next.js) → API Routes → Orchestrator → [Research → Outline → Writer → Style → FactCheck → Editor]
                                       ↓
                                  Trace Logger
                                       ↓
                                  PostgreSQL (Prisma)
```

## Features

- **Content Discovery** — browse trending content from Hacker News, arXiv, and Substack
- **Multi-format output** — tweets, threads, quote retweets, articles
- **Voice emulation** — upload writing samples to match your style
- **Anti-slop** — detects and rewrites AI clichés automatically
- **Fact-checking** — verifies claims with source grounding
- **Full traceability** — every agent call is logged with input, output, reasoning, tokens, and timing

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI API (GPT-4o / GPT-4o-mini)
- **Database**: PostgreSQL via Prisma ORM
- **Deploy**: Vercel (fullstack)

## Getting Started

```bash
# Clone
git clone <repo-url>
cd nfactorial-ai-cup

# Install
pnpm install

# Set up environment
cp .env.example .env
# Add your OPENAI_API_KEY and DATABASE_URL to .env

# Set up database
npx prisma migrate dev --name init

# Run
pnpm dev
```

Open http://localhost:3000

## Environment Variables

```
OPENAI_API_KEY=sk-...        # Your OpenAI API key
DATABASE_URL=postgresql://... # PostgreSQL connection string
```

## Project Structure

```
src/
├── app/              # Next.js pages and API routes
│   ├── page.tsx      # Dashboard
│   ├── create/       # Content creation
│   ├── discover/     # Content discovery feed
│   ├── style/        # Voice/style configuration
│   ├── traces/       # Agent trace viewer
│   └── api/          # API routes
├── lib/
│   ├── agents/       # Agent logic
│   ├── prompts/      # System prompts
│   ├── scrapers/     # Content discovery scrapers
│   ├── traces/       # Trace logging
│   ├── anti-slop.ts  # Banned phrase detection
│   ├── openai.ts     # OpenAI client
│   ├── db.ts         # Prisma client
│   └── types.ts      # Shared TypeScript types
└── components/
    └── ui/           # shadcn/ui components
```

## Agent Traces

All agent interactions are logged with full input/output, reasoning, tokens used, and execution time. View them in the Traces page or export as JSON.
