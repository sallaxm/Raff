import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur-xl p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="text-5xl font-semibold tracking-tight">404</div>
        <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          This page doesn’t exist, or the resource was removed.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-2xl bg-black text-white text-sm hover:opacity-90 transition dark:bg-white dark:text-black"
          >
            Go home
          </Link>
          <Link
            href="/browse"
            className="px-5 py-2.5 rounded-2xl border border-zinc-200 text-sm hover:bg-white/60 transition dark:border-zinc-800 dark:hover:bg-zinc-800/60"
          >
            Browse courses
          </Link>
        </div>
      </div>
    </main>
  );
}
