import Link from "next/link";

export default async function DashboardPage() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-zinc-500 text-sm mt-1">Multi-agent Twitter content engine</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link
          href="/create?type=tweet"
          className="border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-colors"
        >
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-semibold">New Tweet</h3>
          <p className="text-sm text-zinc-500">Generate a single tweet</p>
        </Link>
        <Link
          href="/create?type=thread"
          className="border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-colors"
        >
          <div className="text-2xl mb-2">🧵</div>
          <h3 className="font-semibold">New Thread</h3>
          <p className="text-sm text-zinc-500">Generate a Twitter thread</p>
        </Link>
        <Link
          href="/create?type=quote_retweet"
          className="border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-colors"
        >
          <div className="text-2xl mb-2">🔄</div>
          <h3 className="font-semibold">Quote Retweet</h3>
          <p className="text-sm text-zinc-500">Generate an insightful QRT</p>
        </Link>
      </div>

      {/* Architecture */}
      <div className="border border-zinc-800 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Architecture</h3>
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {["Research", "Outline", "Writer", "Style", "FactCheck", "Editor", "Output"].map(
            (step, i) => (
              <div key={step} className="flex flex-col items-center gap-1">
                <div className="w-full py-3 rounded bg-zinc-800 border border-zinc-700">
                  {step}
                </div>
                {i < 6 && (
                  <span className="text-zinc-600">→</span>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
