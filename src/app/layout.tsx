import type { Metadata } from "next";
import { Geist, Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "AI Cup — Twitter Content Engine",
  description:
    "Multi-agent AI system for generating high-quality X/Twitter content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.variable} ${mono.variable} font-sans antialiased bg-[#0a0a0b] text-zinc-100`}
      >
        <div className="min-h-screen flex flex-col">
          {/* Top nav */}
          <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0b]/80 border-b border-white/[0.06]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold">
                  AI
                </div>
                <span className="font-semibold tracking-tight text-sm">
                  AI Cup
                </span>
              </a>
              <nav className="flex items-center gap-1">
                <a
                  href="/create"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors rounded-md hover:bg-white/[0.04]"
                >
                  Create
                </a>
                <a
                  href="/discover"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors rounded-md hover:bg-white/[0.04]"
                >
                  Discover
                </a>
                <a
                  href="/style"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors rounded-md hover:bg-white/[0.04]"
                >
                  Style
                </a>
                <a
                  href="/traces"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors rounded-md hover:bg-white/[0.04]"
                >
                  Traces
                </a>
              </nav>
            </div>
          </header>
          {/* Main */}
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
