import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Cup — Twitter Content Generator",
  description: "Multi-agent AI system for generating high-quality X/Twitter content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-zinc-950 text-zinc-100`}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r border-zinc-800 p-4 flex flex-col gap-1 shrink-0">
            <div className="px-3 py-4 mb-2">
              <h1 className="text-lg font-bold tracking-tight">
                🧠 AI Cup
              </h1>
              <p className="text-xs text-zinc-500 mt-1">Twitter Content Engine</p>
            </div>
            <nav className="flex flex-col gap-1">
              <a href="/" className="px-3 py-2 rounded-md text-sm hover:bg-zinc-800 transition-colors">
                📊 Dashboard
              </a>
              <a href="/create" className="px-3 py-2 rounded-md text-sm hover:bg-zinc-800 transition-colors">
                ✍️ Create
              </a>
              <a href="/discover" className="px-3 py-2 rounded-md text-sm hover:bg-zinc-800 transition-colors">
                🔍 Discover
              </a>
              <a href="/style" className="px-3 py-2 rounded-md text-sm hover:bg-zinc-800 transition-colors">
                🎨 Style
              </a>
              <a href="/traces" className="px-3 py-2 rounded-md text-sm hover:bg-zinc-800 transition-colors">
                📋 Traces
              </a>
            </nav>
          </aside>
          {/* Main */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
