"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    setDone(false);
    setMsg("");

    const text = (document.getElementById("fb") as HTMLTextAreaElement | null)?.value?.trim() ?? "";
    if (!text) return setMsg("Write something first.");

    // For now: just show success (we’ll wire to DB later if you want)
    setDone(true);
    setMsg("Sent ✅");
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur-xl p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h1 className="text-3xl font-semibold">Feedback</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          Report bugs, request features, or ask for help.
        </p>

        <textarea
          id="fb"
          className="mt-4 w-full min-h-[160px] rounded-3xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900
                     dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          placeholder="Type your feedback…"
        />

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={submit}
            className="px-5 py-2.5 rounded-2xl bg-black text-white text-sm hover:opacity-90 transition dark:bg-white dark:text-black"
          >
            Send
          </button>

          {msg && (
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              {msg}
            </span>
          )}
          {done && <span className="text-sm">✨</span>}
        </div>
      </div>
    </main>
  );
}