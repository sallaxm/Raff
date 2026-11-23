"use client";

import { useState } from "react";

// TODO: persist feedback (e.g. a `feedback` table) — for now it's acknowledged only.
export default function FeedbackPage() {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return setMsg({ ok: false, text: "Write something first." });
    setText("");
    setMsg({ ok: true, text: "Thanks! Your feedback has been noted." });
  }

  return (
    <main className="page-narrow">
      <form onSubmit={submit} className="card space-y-4">
        <div>
          <h1 className="h1">Feedback</h1>
          <p className="mt-2 prose-body">Report bugs, request features, or ask for help.</p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input min-h-[160px] resize-y"
          placeholder="Type your feedback…"
          aria-label="Feedback"
        />

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary">Send</button>
          {msg && <span className={msg.ok ? "text-sm text-emerald-600" : "text-sm text-rose-500"}>{msg.text}</span>}
        </div>
      </form>
    </main>
  );
}
