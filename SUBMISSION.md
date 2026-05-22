# Письмо для отправки Юрию

---

Здравствуйте, Юрий!

Спасибо за приглашение на этап технического задания. Направляю результаты выполнения.

## Деливераблы

**Deployed App:** https://nfactorial-ai-cup.vercel.app/
**GitHub Repository:** https://github.com/R1nlary/nfactorial-ai-cup
**Agent Traces:** agent-traces/traces.json (в репозитории)

## Что реализовано

**Prism** — мультиагентная система генерации контента для X/Twitter с 6-шаговым пайплайном:

Research → Outline → Writer → Style Review + Fact Check (параллельно) → Editor

### Основные фичи
- **Anti-slop система** — 48 забаненных AI-фраз, итеративная критика (при slop > 30 переписывает)
- **Content Discovery** — 3 источника: Hacker News, arXiv, Substack (interleaved)
- **Quote Retweets** — генерация с выбором угла (agree/disagree/add context/humor)
- **Style Profiles** — загрузка writing samples для эмуляции голоса
- **File Upload** — .txt, .md, .csv, .json как контекст для генерации
- **Fact Checking** — проверка утверждений, добавление qualifiers
- **Distribution Agent** — стратегия постинга, viral potential, engagement hooks
- **Memory System** — сохранение предпочтений между сессиями
- **Full Traceability** — каждый вызов агента логируется с input/output/tokens/duration

### Технический стек
Next.js 16 (App Router) + TypeScript, Tailwind CSS 4 + shadcn/ui, OpenAI API, PostgreSQL (Neon) + Prisma ORM, Vitest (38 тестов), Vercel

С уважением,
Бауыржан
