export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight">
          About Raff
        </h1>

        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Raff - meaning "shelf" رف in Arabic -is a student-powered resource exchange designed to make
          university life easier.
        </p>

        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Upload past papers, notes, and assignments.  
          Earn credits.  
          Use credits to access resources shared by other students.
        </p>

        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Built for students in Qatar
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 bg-gradient-to-br from-pink-200/40 via-blue-200/30 to-purple-200/40 dark:from-pink-500/10 dark:via-blue-500/10 dark:to-purple-500/10">
        <h2 className="font-semibold text-lg">
          Our Goal
        </h2>

        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          To become the daily academic companion for every student in Qatar.
        </p>
      </div>

    </main>
  );
}