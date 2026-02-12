"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Upload, User } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/profile", label: "Profile", icon: User },
];

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block md:w-72">
        <div className="h-full border-r border-zinc-200 bg-white">
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="
      grid h-10 w-10 place-items-center
      rounded-2xl
      bg-black text-white
      font-semibold
      dark:bg-white
      dark:text-black
    ">
      R
    </div>

    <div>
      <div className="text-lg font-semibold">Raff</div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        UDST • Engineering
      </div>
    </div>
  </div>

  <ThemeToggle />
</div>
          </div>

          <nav className="mt-6 px-3">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href + "/"));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "mb-1 flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "text-zinc-700 hover:bg-zinc-100"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 px-6">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
              <div className="font-medium text-zinc-800">Tip</div>
              <div className="mt-1 text-zinc-500">
                Use <span className="font-medium">Browse</span> to jump majors → courses quickly.
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-72">
        <div className="mx-auto max-w-[1100px] px-4 pb-24 pt-6 md:px-8 md:pb-10">
          {children}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/90 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-[1100px] items-center justify-around px-3 py-2">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex w-20 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs transition",
                  active ? "text-zinc-900" : "text-zinc-500"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}