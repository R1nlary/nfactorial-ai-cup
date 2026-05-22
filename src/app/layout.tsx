import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navigation } from "@/components/navigation";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OpenClaw — Multi-Agent Content Engine",
  description:
    "7-agent pipeline for generating high-quality Twitter content with research, fact-checking, and style emulation.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} font-[var(--font-body)] antialiased bg-[#08080a] text-zinc-100`}
      >
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/[0.04] py-6">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-600 font-[var(--font-mono)]">
                  nFactorial Agentic AI
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-700 font-[var(--font-mono)]">
                  7 agents
                </span>
                <span className="w-1 h-1 rounded-full bg-[#f5c518]/40" />
                <span className="text-[10px] text-zinc-700 font-[var(--font-mono)]">
                  6 steps
                </span>
                <span className="w-1 h-1 rounded-full bg-[#ff6b35]/40" />
                <span className="text-[10px] text-zinc-700 font-[var(--font-mono)]">
                  1 pipeline
                </span>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
