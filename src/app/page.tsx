import Link from "next/link";

const AGENTS = [
  { name: "Research", icon: "🔍", desc: "Finds non-obvious insights & data" },
  { name: "Outline", icon: "📋", desc: "Generates angles & hooks" },
  { name: "Writer", icon: "✍️", desc: "Drafts in your voice" },
  { name: "Style", icon: "🎨", desc: "Kills AI patterns" },
  { name: "FactCheck", icon: "✅", desc: "Verifies claims" },
  { name: "Editor", icon: "📝", desc: "Polishes final output" },
];

export default async function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Hero */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-xs text-zinc-500 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          7 agents online
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
          Twitter content<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            that doesn&apos;t suck
          </span>
        </h1>
        <p className="text-zinc-500 text-sm sm:text-base max-w-lg leading-relaxed">
          Multi-agent pipeline that researches, writes, fact-checks and edits
          — producing content with actual insight density.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-16">
        <Link
          href="/create?type=tweet"
          className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-violet-500/30 transition-all duration-300"
        >
          <div className="text-lg mb-3">💬</div>
          <h3 className="font-semibold text-sm mb-1">Tweet</h3>
          <p className="text-xs text-zinc-500">
            Single impactful tweet with data
          </p>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link
          href="/create?type=thread"
          className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-fuchsia-500/30 transition-all duration-300"
        >
          <div className="text-lg mb-3">🧵</div>
          <h3 className="font-semibold text-sm mb-1">Thread</h3>
          <p className="text-xs text-zinc-500">
            Multi-tweet narrative with hooks
          </p>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link
          href="/create?type=quote_retweet"
          className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-emerald-500/30 transition-all duration-300"
        >
          <div className="text-lg mb-3">🔄</div>
          <h3 className="font-semibold text-sm mb-1">Quote Retweet</h3>
          <p className="text-xs text-zinc-500">
            Insightful take, not a summary
          </p>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Pipeline */}
      <div>
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
          Agent Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-4 text-center"
            >
              <div className="text-xl mb-2">{agent.icon}</div>
              <div className="text-xs font-medium mb-1">{agent.name}</div>
              <div className="text-[10px] text-zinc-600 leading-tight">
                {agent.desc}
              </div>
              {i < AGENTS.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-zinc-700">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
