"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [sent, setSent] = useState(false);
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim()) return;

    // For beta — just collect manually.
    // Later you can store in DB.
    console.log("Feedback:", text);

    setSent(true);
    setText("");
  }

  return (
    <main className="max-w-2xl mx-auto p-6">

      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight">
          Feedback
        </h1>

        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          Found a bug? Want a feature? Tell us.
        </p>

        {!sent ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your feedback..."
              className="
                mt-4 w-full h-32
                rounded-2xl
                border border-zinc-200 dark:border-zinc-800
                bg-white dark:bg-zinc-900
                p-3
              "
            />

            <button
              onClick={submit}
              className="
                mt-4 px-5 py-2 rounded-2xl
                bg-black text-white
                dark:bg-white dark:text-black
              "
            >
              Send Feedback
            </button>
          </>
        ) : (
          <p className="mt-4 text-green-600">
            Thanks — this helps improve Raff.
          </p>
        )}
      </div>

    </main>
  );
}