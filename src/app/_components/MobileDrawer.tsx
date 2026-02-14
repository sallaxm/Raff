"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import SideNav from "@/app/_components/SideNav";

export default function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // prevent body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Top bar (mobile only) */}
      <header
        className="
          md:hidden sticky top-0 z-40
          bg-white/65 dark:bg-zinc-900/65
          backdrop-blur-xl
          border-b border-white/40 dark:border-zinc-800
        "
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="
              inline-flex items-center justify-center
              w-10 h-10 rounded-2xl
              border border-white/40 dark:border-zinc-800
              bg-white/50 dark:bg-zinc-900/40
              hover:bg-white/70 dark:hover:bg-zinc-900/60
              transition
            "
            aria-label="Open menu"
          >
            {/* hamburger */}
            <span className="sr-only">Menu</span>
            <div className="space-y-1">
              <div className="w-5 h-[2px] bg-zinc-900 dark:bg-zinc-100" />
              <div className="w-5 h-[2px] bg-zinc-900 dark:bg-zinc-100 opacity-80" />
              <div className="w-5 h-[2px] bg-zinc-900 dark:bg-zinc-100 opacity-60" />
            </div>
          </button>

          <Link href="/" className="font-semibold tracking-tight">
            Raff
          </Link>

          <ThemeToggle />
        </div>
      </header>

      {/* Drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* backdrop */}
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />

          {/* panel */}
          <aside
            className="
              absolute left-0 top-0 h-full
              w-[320px] max-w-[85vw]
              bg-white/70 dark:bg-zinc-900/70
              backdrop-blur-2xl
              border-r border-white/40 dark:border-zinc-800
              shadow-[0_20px_60px_rgba(0,0,0,0.25)]
              p-3
            "
          >
            {/* brand card */}
            <div className="p-2">
              <div className="rounded-3xl border border-white/40 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 p-4">
                <div className="text-lg font-semibold tracking-tight">Raff</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Student resource exchange
                </div>
              </div>
            </div>

            <div className="px-1">
              <SideNav />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}