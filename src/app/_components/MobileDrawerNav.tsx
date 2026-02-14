"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import SideNav from "@/app/_components/SideNav";
import Link from "next/link";

export default function MobileDrawerNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded-2xl hover:bg-white/60 dark:hover:bg-zinc-800/60 transition text-sm"
        aria-label="Open menu"
      >
        ☰
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* drawer */}
          <div
            className="
              absolute left-0 top-0 h-full w-[320px] max-w-[85vw]
              bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl
              border-r border-white/40 dark:border-zinc-800
              shadow-[0_10px_40px_rgba(0,0,0,0.25)]
              p-4 overflow-y-auto
            "
          >
            {/* Brand */}
            <div className="rounded-3xl border border-white/40 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold tracking-tight">Raff</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Student resource exchange
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-2xl hover:bg-white/60 dark:hover:bg-zinc-800/60 transition text-sm"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3">
                <ThemeToggle />
              </div>
            </div>

            {/* Nav */}
            <div className="mt-4">
              <SideNav />
            </div>

            {/* Settings group */}
            <div className="mt-4 rounded-3xl border border-white/40 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 p-3 space-y-1">
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-2xl text-sm text-zinc-700 hover:bg-white/60 dark:text-zinc-200 dark:hover:bg-zinc-800/60 transition"
              >
                About
              </Link>
              <Link
                href="/privacy"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-2xl text-sm text-zinc-700 hover:bg-white/60 dark:text-zinc-200 dark:hover:bg-zinc-800/60 transition"
              >
                Privacy
              </Link>
              <Link
                href="/feedback"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-2xl text-sm text-zinc-700 hover:bg-white/60 dark:text-zinc-200 dark:hover:bg-zinc-800/60 transition"
              >
                Feedback
              </Link>

              <div className="px-3 pt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                Tip: upload past papers to earn credits.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}