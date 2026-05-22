import Link from "next/link";
import { MessageSquare, AlignLeft, Quote, ArrowRight, Search, FileText, Shield, Sparkles, CheckCircle, Pencil } from "lucide-react";

const PIPELINE = [
  { step: "01", name: "Research", desc: "Non-obvious insights", icon: Search, color: "#f5c518" },
  { step: "02", name: "Outline", desc: "Angles & hooks", icon: FileText, color: "#ff6b35" },
  { step: "03", name: "Draft", desc: "Write in your voice", icon: Pencil, color: "#e85d75" },
  { step: "04", name: "Style", desc: "Kill AI patterns", icon: Sparkles, color: "#a78bfa" },
  { step: "05", name: "Fact Check", desc: "Verify claims", icon: Shield, color: "#34d399" },
  { step: "06", name: "Edit", desc: "Sharpen hooks", icon: CheckCircle, color: "#60a5fa" },
];

const ACTIONS = [
  { href: "/create?type=tweet", label: "Tweet", desc: "Single tweet with data & hook", icon: MessageSquare, color: "#f5c518" },
  { href: "/create?type=thread", label: "Thread", desc: "Multi-tweet narrative arc", icon: AlignLeft, color: "#ff6b35" },
  { href: "/create?type=quote_retweet", label: "Quote RT", desc: "Add genuine insight", icon: Quote, color: "#34d399" },
];

export default async function DashboardPage() {
  return (
    <div className="relative">
      {/* Hero with gradient mesh */}
      <section className="relative overflow-hidden">
        <div className="gradient-mesh grid-dots absolute inset-0" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5c518]/8 border border-[#f5c518]/15 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5c518] animate-pulse" />
              <span className="font-[var(--font-mono)] text-[10px] tracking-wider text-[#f5c518] uppercase">
                Multi-Agent System
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
              Content engine
              <br />
              <span className="text-gradient-gold">that actually thinks.</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-lg leading-relaxed mb-8">
              6 specialized agents research, write, fact-check and edit — producing
              Twitter content with real insight density, not AI slop.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#f5c518] text-[#08080a] text-sm font-semibold hover:bg-[#e8b800] transition-all glow-gold-sm hover:glow-gold"
            >
              Start Creating
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in-up animate-delay-2">
          {ACTIONS.map(({ href, label, desc, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="group relative rounded-xl border border-white/[0.06] bg-[#0e0e11] p-5 hover:border-white/[0.12] transition-all duration-300 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}10` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <ArrowRight
                  className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all"
                />
              </div>
              <h3 className="text-sm font-semibold mb-1 group-hover:text-white transition-colors">
                {label}
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Pipeline visualization */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in-up animate-delay-4">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="font-[var(--font-mono)] text-[10px] tracking-widest text-zinc-500 uppercase">
            Agent Pipeline
          </h2>
          <div className="flex-1 h-px bg-white/[0.04]" />
        </div>

        {/* Horizontal pipeline on desktop, vertical on mobile */}
        <div className="hidden sm:grid grid-cols-6 gap-3">
          {PIPELINE.map((agent, i) => (
            <div key={agent.name} className="relative group">
              <div className="rounded-xl border border-white/[0.06] bg-[#0e0e11] p-4 hover:border-white/[0.1] transition-all card-hover">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${agent.color}10` }}
                >
                  <agent.icon className="w-4 h-4" style={{ color: agent.color }} />
                </div>
                <div className="font-[var(--font-mono)] text-[9px] text-zinc-700 mb-1">
                  {agent.step}
                </div>
                <h3 className="text-xs font-semibold mb-0.5">{agent.name}</h3>
                <p className="text-[10px] text-zinc-600 leading-relaxed">{agent.desc}</p>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="absolute top-1/2 -right-2 w-4 h-px bg-white/[0.08] hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Mobile vertical layout */}
        <div className="sm:hidden space-y-0">
          {PIPELINE.map((agent, i) => (
            <div key={agent.name} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${agent.color}10` }}
                >
                  <agent.icon className="w-4 h-4" style={{ color: agent.color }} />
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className="w-px h-8 pipeline-line mt-1" />
                )}
              </div>
              <div className="pb-6">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-semibold">{agent.name}</h3>
                  <span className="font-[var(--font-mono)] text-[9px] text-zinc-700">{agent.step}</span>
                </div>
                <p className="text-xs text-zinc-600">{agent.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
