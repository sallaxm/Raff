export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">

      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight">
          Privacy
        </h1>

        <p className="mt-4 text-zinc-600 dark:text-zinc-300">
          Raff collects only the information necessary to operate the platform.
        </p>

        <ul className="mt-4 space-y-2 text-zinc-600 dark:text-zinc-300">
          <li>• Your university email for authentication</li>
          <li>• Uploaded academic files</li>
          <li>• Credit transaction history</li>
        </ul>

        <p className="mt-4 text-zinc-600 dark:text-zinc-300">
          We do not sell your data. Ever.
        </p>

        <p className="mt-4 text-zinc-600 dark:text-zinc-300">
          Files are moderated before becoming visible to other students.
        </p>
      </div>

    </main>
  );
}