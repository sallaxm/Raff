"use client";

import { useState } from "react";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

const TOPICS = ["Bug report", "Feature request", "Account / data request", "Other"] as const;

export default function FeedbackPage() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("Bug report");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");

  function submit() {
    setMsg("");
    const body = text.trim();
    if (!body) return setMsg("Write something first.");

    if (!CONTACT_EMAIL) {
      return setMsg("Feedback isn't set up yet. Please try again later.");
    }

    const subject = encodeURIComponent(`[Raff] ${topic}`);
    const encodedBody = encodeURIComponent(
      `${body}\n\n---\nPage: ${window.location.origin}\nBrowser: ${navigator.userAgent}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodedBody}`;
    setMsg("Your email app should open with your message. Hit send there.");
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur-xl p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h1 className="text-3xl font-semibold">Feedback</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          Report bugs, request features, ask for help, or request account deletion.
        </p>

        <label className="mt-5 block text-sm font-medium" htmlFor="fb-topic">
          Topic
        </label>
        <select
          id="fb-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value as (typeof TOPICS)[number])}
          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900
                     dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-sm font-medium" htmlFor="fb">
          Message
        </label>
        <textarea
          id="fb"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-2 w-full min-h-[160px] rounded-3xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900
                     dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          placeholder="What happened, or what would you like to see?"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={submit}
            className="px-5 py-2.5 rounded-2xl bg-black text-white text-sm hover:opacity-90 transition dark:bg-white dark:text-black"
          >
            Send
          </button>

          {msg && <span className="text-sm text-zinc-600 dark:text-zinc-300">{msg}</span>}
        </div>

        {CONTACT_EMAIL && (
          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            Or email us directly at{" "}
            <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        )}
      </div>
    </main>
  );
}
