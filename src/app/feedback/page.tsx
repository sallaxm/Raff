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
    window.location.assign(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodedBody}`);
    setMsg("Your email app should open with your message. Hit send there.");
  }

  return (
    <main className="page-narrow">
      <div className="card">
        <h1 className="h1">Feedback</h1>
        <p className="mt-2 prose-body">
          Report bugs, request features, ask for help, or request account deletion.
        </p>

        <label className="label mt-5" htmlFor="fb-topic">
          Topic
        </label>
        <select
          id="fb-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value as (typeof TOPICS)[number])}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className="label mt-4" htmlFor="fb">
          Message
        </label>
        <textarea
          id="fb"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input min-h-[160px] resize-y"
          placeholder="What happened, or what would you like to see?"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submit}
            className="btn-primary"
          >
            Send
          </button>

          {msg && <span className="text-sm muted">{msg}</span>}
        </div>

        {CONTACT_EMAIL && (
          <p className="mt-4 text-xs muted">
            Or email us directly at{" "}
            <a className="underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        )}
      </div>
    </main>
  );
}
