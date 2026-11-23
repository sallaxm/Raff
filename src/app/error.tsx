"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16 text-center">
      <div className="card-hero space-y-3">
        <h1 className="h2">Something went wrong</h1>
        <p className="muted">
          Try again. If it keeps happening, let us know on the Feedback page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
