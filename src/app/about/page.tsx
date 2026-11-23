import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About · Raff",
  description: "How Raff works: share study material, earn credits, download what you need.",
};

const card =
  "rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur-xl p-6 dark:border-zinc-800 dark:bg-zinc-900/60";
const muted = "text-zinc-600 dark:text-zinc-300";

const steps = [
  {
    title: "Upload",
    body: "Share your own notes, graded assignments, lab reports or study guides, filed under the right course.",
  },
  {
    title: "Get reviewed",
    body: "A moderator checks every upload against the guidelines before it goes public.",
  },
  {
    title: "Earn credits",
    body: "Once approved, you earn credits based on how substantial the resource is.",
  },
  {
    title: "Download",
    body: "Spend credits to download what other students have shared.",
  },
];

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className={card}>
        <h1 className="text-3xl font-semibold">About Raff</h1>
        <p className={`mt-3 ${muted}`}>
          Raff is a student resource exchange, starting with UDST. Past papers, notes, labs and
          assignments are organised by college, major and course, so you can find what you need for
          the module you’re actually taking.
        </p>
        <p className={`mt-3 ${muted}`}>
          It runs on a simple idea: students who share good material should get something back.
          Uploading earns credits, and credits are what you spend to download.
        </p>
      </div>

      <div className={card}>
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="rounded-2xl border border-zinc-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
            >
              <div className="text-xs font-semibold text-zinc-400">STEP {i + 1}</div>
              <div className="mt-1 font-semibold">{s.title}</div>
              <p className={`mt-1 text-sm ${muted}`}>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className={card}>
        <h2 className="text-xl font-semibold">Credits</h2>
        <ul className={`mt-3 space-y-2 ${muted}`}>
          <li>• New accounts start with <strong>20 credits</strong>.</li>
          <li>
            • A download costs roughly <strong>1 credit per 5 pages</strong> (minimum 1, maximum
            20). You only pay once per resource.
          </li>
          <li>
            • An approved upload earns about <strong>60% of its download cost</strong>. Moderators
            can raise this for especially high-quality material.
          </li>
          <li>• Your first approved upload earns a <strong>+3 bonus</strong>.</li>
        </ul>
        <p className={`mt-3 text-sm ${muted}`}>
          You can see every credit you’ve earned or spent on the{" "}
          <Link href="/credits" className="underline">
            Credits
          </Link>{" "}
          page.
        </p>
      </div>

      <div className={card}>
        <h2 className="text-xl font-semibold">Fair use</h2>
        <p className={`mt-3 ${muted}`}>
          Raff is for studying, not cheating. Leaked exams, paid solutions, copyrighted textbooks
          and instructor-only material aren’t allowed. Read the{" "}
          <Link href="/guidelines" className="underline">
            upload guidelines
          </Link>{" "}
          before sharing anything. Uploads are limited to 10 per day and 50&nbsp;MB per file.
        </p>
        <p className={`mt-3 ${muted}`}>
          Questions or ideas?{" "}
          <Link href="/feedback" className="underline">
            Send us feedback
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
