import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import SideNav from "@/app/_components/SideNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raff",
  description: "Past papers, notes, and assignments — organized by course.",
};

/**
 * NOTE:
 * - Desktop: same sidebar layout you already had.
 * - Mobile: a real overlay drawer (z-50) so it never renders behind content.
 */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="
          min-h-screen text-zinc-900 dark:text-white
          bg-zinc-50 dark:bg-black
          overflow-x-hidden
        "
      >
        {/* Background that makes “glass” visible */}
        <div
          className="
            min-h-screen
            bg-[radial-gradient(circle_at_20%_10%,rgba(255,192,203,0.25),transparent_40%),
                radial-gradient(circle_at_80%_20%,rgba(147,197,253,0.22),transparent_45%),
                radial-gradient(circle_at_50%_80%,rgba(216,180,254,0.18),transparent_55%)]
            dark:bg-[radial-gradient(circle_at_20%_10%,rgba(147,197,253,0.10),transparent_40%),
                radial-gradient(circle_at_80%_20%,rgba(244,114,182,0.08),transparent_45%),
                radial-gradient(circle_at_50%_80%,rgba(167,139,250,0.08),transparent_55%)]
          "
        >
          <div className="min-h-screen flex">
            {/* Desktop sidebar (unchanged) */}
            <aside
              className="
                hidden md:flex md:flex-col
                w-72
                sticky top-0 h-[calc(100vh-1.5rem)]
                m-3 rounded-3xl

                bg-white/55 dark:bg-zinc-900/55
                backdrop-blur-xl

                border border-white/40 dark:border-zinc-800
                shadow-[0_10px_40px_rgba(0,0,0,0.06)]
              "
            >
              {/* Brand */}
              <div className="p-4">
                <div className="rounded-3xl border border-white/40 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 p-4">
                  <div className="text-lg font-semibold tracking-tight">Raff</div>

                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Student resource exchange
                  </div>

                  <div className="mt-3">
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              {/* Nav */}
              <SideNav />
            </aside>

            {/* Main */}
            <div className="flex-1">
              {/* Mobile Drawer (overlay, not behind content) */}
              <MobileDrawer />

              <div className="max-w-5xl mx-auto px-4 md:px-0 py-6">{children}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

/** Mobile drawer component kept in this file so you only paste one thing */
function MobileDrawer() {
  return (
    <div className="md:hidden">
      <input id="raff-drawer" type="checkbox" className="peer hidden" />

      {/* Top bar */}
      <header
        className="
          sticky top-0 z-40
          bg-white/55 dark:bg-zinc-900/55
          backdrop-blur-xl
          border-b border-white/40 dark:border-zinc-800
        "
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Menu button */}
          <label
            htmlFor="raff-drawer"
            className="
              inline-flex items-center justify-center
              w-10 h-10 rounded-2xl cursor-pointer
              border border-white/40 dark:border-zinc-800
              bg-white/50 dark:bg-zinc-900/40
              hover:bg-white/70 dark:hover:bg-zinc-900/60
              transition
            "
            aria-label="Open menu"
          >
            <div className="space-y-1">
              <div className="w-5 h-[2px] bg-zinc-900 dark:bg-zinc-100" />
              <div className="w-5 h-[2px] bg-zinc-900 dark:bg-zinc-100 opacity-80" />
              <div className="w-5 h-[2px] bg-zinc-900 dark:bg-zinc-100 opacity-60" />
            </div>
          </label>

          <div className="font-semibold tracking-tight">Raff</div>

          <ThemeToggle />
        </div>
      </header>

      {/* Backdrop */}
      <label
        htmlFor="raff-drawer"
        className="
          fixed inset-0 z-50 hidden
          peer-checked:block
          bg-black/40 backdrop-blur-[2px]
        "
        aria-label="Close menu"
      />

      {/* Drawer panel */}
      <aside
        className="
          fixed top-0 left-0 z-[60]
          h-full w-[260px] max-w-[72vw]
          -translate-x-full peer-checked:translate-x-0
          transition-transform duration-200

          bg-white/70 dark:bg-zinc-900/70
          backdrop-blur-2xl
          border-r border-white/40 dark:border-zinc-800
          shadow-[0_20px_60px_rgba(0,0,0,0.25)]
          p-3
        "
      >
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
  );
}