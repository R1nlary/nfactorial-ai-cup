"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, PenLine, Compass, Palette, Activity, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/create", label: "Create", icon: PenLine },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/style", label: "Style", icon: Palette },
  { href: "/traces", label: "Traces", icon: Activity },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#08080a]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[#f5c518]/10 flex items-center justify-center group-hover:bg-[#f5c518]/15 transition-colors">
            <Zap className="w-3.5 h-3.5 text-[#f5c518]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-[var(--font-mono)] text-[13px] tracking-wide text-white font-semibold">
              Prism
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3 py-2 text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  active
                    ? "text-[#f5c518]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-px bg-[#f5c518]/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden p-2 text-zinc-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Header gradient border */}
      <div className="header-border" />

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="sm:hidden bg-[#0e0e11]/95 backdrop-blur-xl border-b border-white/[0.06] animate-slide-up">
          <nav className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? "text-[#f5c518] bg-[#f5c518]/5"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
