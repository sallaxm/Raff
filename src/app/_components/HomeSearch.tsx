"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/resources?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={go} className="space-y-2">
      <div
        className="
          flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2
          shadow-sm dark:bg-zinc-900 dark:border-zinc-800
        "
      >
        <span className="text-zinc-400">⌕</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search past papers, notes, assignments…"
          className="w-full bg-transparent outline-none text-sm"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="text-xs px-2 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 transition dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="
            px-4 py-2 rounded-2xl bg-black text-white text-sm
            hover:opacity-90 transition
            dark:bg-white dark:text-black
          "
        >
          Search
        </button>

        <button
          type="button"
          onClick={() => router.push("/browse")}
          className="
            px-4 py-2 rounded-2xl border border-zinc-200 text-sm
            hover:bg-zinc-50 transition
            dark:border-zinc-800 dark:hover:bg-zinc-900
          "
        >
          Browse
        </button>
      </div>
    </form>
  );
}