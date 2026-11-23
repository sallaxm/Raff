import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "How Raff works: share study material, earn credits, download what you need.",
};


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
    body: "You earn credits when it's approved, then again every time someone downloads it.",
  },
  {
    title: "Download",
    body: "Spend credits to download what other students have shared.",
  },
];

export default function AboutPage() {
  return (
    <main className="page-narrow">
      <div className="card">
        <h1 className="h1">About Raff</h1>
        <p className="mt-3 prose-body">
          Raff is a student resource exchange, starting with UDST. Past papers, notes, labs and
          assignments are organised by college, major and course, so you can find what you need for
          the module you’re actually taking.
        </p>
        <p className="mt-3 prose-body">
          It runs on a simple idea: students who share good material should get something back.
          Uploading earns credits, and credits are what you spend to download.
        </p>
      </div>

      <div className="card">
        <h2 className="h2">How it works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="rounded-2xl border border-zinc-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
            >
              <div className="text-xs font-semibold text-zinc-400">STEP {i + 1}</div>
              <div className="mt-1 font-semibold">{s.title}</div>
              <p className="mt-1 text-sm muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="card">
        <h2 className="h2">Credits</h2>
        <ul className="mt-3 space-y-2 prose-body">
          <li>• New accounts start with <strong>10 credits</strong>.</li>
          <li>
            • A file costs <strong>2 credits</strong>. You only pay once — re-opening it is free.
            Moderators may price exceptional material higher.
          </li>
          <li>
            • When a moderator approves your upload you get <strong>+2 credits</strong>, and your
            first approved upload earns a <strong>+10 bonus</strong>.
          </li>
          <li>
            • Every time someone downloads your file, <strong>you earn half the price</strong> (1
            credit for a normal file). Good uploads keep paying.
          </li>
          <li>
            • Short on credits? You can{" "}
            <Link href="/credits" className="underline underline-offset-4">
              top up in QAR
            </Link>
            .
          </li>
        </ul>
        <p className="mt-3 text-sm prose-body">
          You can see every credit you’ve earned or spent on the{" "}
          <Link href="/credits" className="underline underline-offset-4">
            Credits
          </Link>{" "}
          page.
        </p>
      </div>

      <div className="card">
        <h2 className="h2">Fair use</h2>
        <p className="mt-3 prose-body">
          Raff is for studying, not cheating. Leaked exams, paid solutions, copyrighted textbooks
          and instructor-only material aren’t allowed. Read the{" "}
          <Link href="/guidelines" className="underline underline-offset-4">
            upload guidelines
          </Link>{" "}
          before sharing anything. Uploads are limited to 10 per day and 50&nbsp;MB per file.
        </p>
        <p className="mt-3 prose-body">
          Questions or ideas?{" "}
          <Link href="/feedback" className="underline underline-offset-4">
            Send us feedback
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
