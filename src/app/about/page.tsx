export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur-xl p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h1 className="text-3xl font-semibold">About Raff</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Raff is a student resource exchange for UDST — past papers, notes, labs, and assignments,
          organized by college, major, and course.
        </p>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Upload useful material → mods approve → you earn credits. Downloading costs credits.
        </p>
      </div>
    </main>
  );
}