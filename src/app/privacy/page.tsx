export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur-xl p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h1 className="text-3xl font-semibold">Privacy</h1>

        <div className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-300">
          <p>
            Raff uses your university email to authenticate you. We store your account id, credits,
            and upload/download history to run the credit system.
          </p>
          <p>
            Uploaded files are stored in Supabase Storage. Moderators can view files for review.
          </p>
          <p>
            We don’t sell your personal data. If you want your account removed, contact us via the
            Feedback page.
          </p>
        </div>
      </div>
    </main>
  );
}