# Prism — Multi-Agent Twitter Content Engine

> **nFactorial Agentic AI Engineer Hiring Test** — Bauyrzhan Shamen

Multi-agent AI system that generates high-quality, non-generic X/Twitter content through a 6-step agent pipeline with iterative critique, fact-checking, style emulation, file upload, memory, and distribution planning.

**Live:** https://nfactorial-ai-cup.vercel.app/
**Repo:** https://github.com/R1nlary/nfactorial-ai-cup

---

## How It Works

You give it a topic → 6 specialized agents process it in sequence → you get polished, fact-checked content that reads like a human wrote it. Optionally: a Distribution Agent plans your posting strategy.

### Agent Pipeline

```
Research → Outline → Writer → Style Review + Fact Check (parallel) → Editor → Distribution (optional)
                                              ↓
                                    Iterative Critique Loop
                                    (if slop score > 30, rewrites)
```

| Step | Agent | What it does |
|------|-------|-------------|
| 1 | **Research** | Finds non-obvious insights, data points, contrarian angles |
| 2 | **Outline** | Generates multiple hooks, angles, and narrative structures |
| 3 | **Writer** | Drafts content in your voice (not AI voice) |
| 4a | **Style Reviewer** | Detects AI patterns, bans clichés, measures naturalness |
| 4b | **Fact Checker** | Verifies claims, flags unsupported assertions |
| 5 | **Editor** | Polishes using all feedback — style edits, fact corrections, slop phrases |
| 6 | **Distribution** | Plans posting strategy, viral potential, engagement hooks |

If the anti-slop score is > 30 or naturalness < 70, the Writer re-runs with feedback (max 2 iterations).

### Anti-Slop System

48 banned AI clichés ("delve into", "game-changer", "it's worth noting", etc.). After the Writer produces a draft:

1. `detectSlop()` scores the text and extracts offending phrases
2. `cleanSlop()` rewrites flagged phrases
3. Results feed into the Editor for final polish

### Content Discovery

Browse trending content from 3 sources (interleaved):
- **Hacker News** — via Algolia API
- **arXiv** — cs.AI, cs.CL, cs.LG papers
- **Newsletters** — Stratechery, Lenny's, One Useful Thing, Latent Space, Simon Willison, Pragmatic Engineer

Each discovered item has a "Generate from this" link to create content about it.

### Style Profiles

Upload your own writing samples. The system extracts your voice patterns and applies them during generation.

### File Upload

Upload .txt, .md, .csv, .json files as additional context. The content is extracted and passed to all agents for grounded generation.

### Memory System

Save preferences (tone, audience, topics to avoid). The system injects them as context in every generation, creating consistency across sessions.

### Distribution Agent

After generating content, get a posting strategy: best time to post, viral potential score (1-10), engagement hooks, follow-up strategy, and cross-post suggestions.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **AI:** OpenAI API (GPT-4o + GPT-4o-mini)
- **Database:** PostgreSQL (Neon) via Prisma ORM 6
- **Testing:** Vitest (38 tests)
- **Deploy:** Vercel (fullstack)
- **Package Manager:** pnpm

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard with pipeline visualization
│   ├── create/page.tsx       # Content generation with file upload + distribution
│   ├── discover/page.tsx     # Content discovery from HN, arXiv, newsletters
│   ├── style/page.tsx        # Voice profile management
│   ├── memory/page.tsx       # User preferences and memory
│   ├── traces/page.tsx       # Agent trace viewer with stats
│   └── api/
│       ├── generate/route.ts         # Main generation endpoint
│       ├── quote-retweet/route.ts    # Quote retweet generation
│       ├── discover/route.ts         # Content discovery endpoint
│       ├── distribute/route.ts       # Distribution planning
│       ├── upload/route.ts           # File upload for context
│       ├── memory/route.ts           # User memory CRUD
│       ├── style/route.ts            # Style profile CRUD
│       └── traces/route.ts           # Trace export
├── lib/
│   ├── agents/
│   │   ├── orchestrator.ts   # Pipeline coordinator with critique loop
│   │   ├── base-agent.ts     # Base class with tracing
│   │   ├── research.ts       # Research agent
│   │   ├── outline.ts        # Outline agent
│   │   ├── writer.ts         # Draft writer
│   │   ├── style-reviewer.ts # AI pattern detector
│   │   ├── fact-checker.ts   # Claim verification
│   │   ├── editor.ts         # Final polish
│   │   └── distribution.ts   # Distribution strategy
│   ├── prompts/              # System prompts for each agent
│   ├── scrapers/             # HN, arXiv, Substack scrapers
│   ├── traces/logger.ts      # Trace persistence
│   ├── anti-slop.ts          # Banned phrase detection & rewriting
│   ├── openai.ts             # Lazy OpenAI client init
│   ├── db.ts                 # Prisma singleton
│   └── types.ts              # Shared TypeScript types
├── components/
│   ├── navigation.tsx        # Nav with active state + mobile menu
│   └── ui/                   # shadcn/ui components
agent-traces/
└── traces.json               # 50 traces from 8 generations
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- OpenAI API key

### Setup

```bash
git clone https://github.com/R1nlary/nfactorial-ai-cup.git
cd nfactorial-ai-cup

pnpm install

# Create .env with your keys
cp .env.example .env
# Edit .env — add OPENAI_API_KEY (required) and DATABASE_URL

# Set up database
npx prisma db push
npx prisma generate

# Run
pnpm dev
```

Open http://localhost:3000

### Environment Variables

```env
# Required — your OpenAI API key for agent pipeline
OPENAI_API_KEY=sk-...

# Required — PostgreSQL connection string
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

> ⚠️ The app will start without these but generation won't work. Content discovery works without an API key.

### Running Tests

```bash
pnpm test
```

38 tests across 6 files:
- Anti-slop detection & cleaning (13 tests)
- Scraper output parsing (13 tests)
- Base agent tracing (5 tests)
- Orchestrator pipeline (5 tests)

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Generate content (tweet, thread, article) |
| `/api/quote-retweet` | POST | Generate quote retweet with angle |
| `/api/discover` | GET | Fetch trending content (`?source=all\|hackernews\|arxiv\|substack`) |
| `/api/distribute` | POST | Generate distribution strategy for content |
| `/api/upload` | POST/GET | Upload files as context / list uploaded files |
| `/api/memory` | GET/POST/DELETE | Manage user preferences and memory |
| `/api/style` | GET/POST | List or create style profiles |
| `/api/style/[id]` | DELETE | Delete a style profile |
| `/api/traces` | GET | List all agent traces (`?export=true` for raw JSON) |

### Generate Example

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"topic":"Why most AI startups fail","type":"tweet"}'
```

Response includes `content`, `traces` (per-agent details), and `iterations` count.

---

## Agent Traces

50 traces from 8 test generations are saved in `agent-traces/traces.json`. Each trace records:

- Agent name, model used
- Full input and output
- Token usage (prompt + completion)
- Execution time in ms
- Reasoning (where applicable)

7 unique agents across 8 content pieces.
