"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur-xl p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          Try again. If it keeps happening, let us know on the Feedback page.
        </p>
        <button
          onClick={reset}
          className="mt-6 px-5 py-2.5 rounded-2xl bg-black text-white text-sm hover:opacity-90 transition dark:bg-white dark:text-black"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
