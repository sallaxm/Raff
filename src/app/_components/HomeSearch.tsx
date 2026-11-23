"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

export default function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/resources?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <label className="flex flex-1 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:ring-blue-900/50">
        <Search size={16} className="shrink-0 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search past papers, notes, assignments…"
          aria-label="Search resources"
          className="w-full bg-transparent text-sm outline-none"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="text-zinc-400 hover:text-zinc-600">
            <X size={16} />
          </button>
        )}
      </label>
      <button type="submit" className="btn-primary">
        Search
      </button>
    </form>
  );
}
