"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

/** Course-first search box. Submits to /search?q=… */
export default function SearchBox({
  defaultValue = "",
  autoFocus = false,
  size = "md",
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  size?: "md" | "lg";
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={submit} role="search" className="flex gap-2">
      <label
        className={`flex flex-1 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:ring-blue-900/50 ${
          size === "lg" ? "py-3.5" : "py-2.5"
        }`}
      >
        <Search size={18} className="shrink-0 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Course code or name, e.g. MATH1030 or Calculus"
          aria-label="Search courses and files"
          autoFocus={autoFocus}
          className="w-full bg-transparent text-sm outline-none"
          enterKeyHint="search"
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
