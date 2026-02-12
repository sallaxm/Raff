import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import SideNav from "@/app/_components/SideNav";
import "./globals.css";


export const metadata: Metadata = {
  title: "Raff",
  description: "Past papers, notes, and assignments — organized by course.",
};

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-2
        px-3 py-2 rounded-2xl
        text-sm text-zinc-700
        hover:bg-white/60 transition
        dark:text-zinc-200 dark:hover:bg-zinc-800/60
      "
    >
      <span className="opacity-70">•</span>
      <span>{label}</span>
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="
          min-h-screen text-zinc-900 dark:text-white
          bg-zinc-50 dark:bg-black
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
            {/* Sidebar (glass) */}
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
                  <div className="text-lg font-semibold tracking-tight">
                      Raff
                  </div>

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

              {/* Footer card */}
              <div className="p-4">
                <div className="rounded-3xl border border-white/40 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 p-4">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Tip: upload past papers to earn credits.
                  </div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <div className="flex-1">
              {/* Mobile top bar */}
              <div
                className="
                  md:hidden sticky top-0 z-20
                  bg-white/55 dark:bg-zinc-900/55
                  backdrop-blur-xl
                  border-b border-white/40 dark:border-zinc-800
                "
              >
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                  <Link href="/" className="font-semibold">
                    Qatar Uni Share
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link
                      className="px-3 py-2 rounded-2xl hover:bg-white/60 dark:hover:bg-zinc-800/60 transition text-sm"
                      href="/browse"
                    >
                      Browse
                    </Link>
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              <div className="max-w-5xl mx-auto">{children}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}