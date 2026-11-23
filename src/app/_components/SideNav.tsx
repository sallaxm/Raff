"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Coins,
  FileText,
  FolderSearch,
  Home,
  Info,
  MessageSquare,
  Shield,
  ShieldCheck,
  Upload,
  User,
  type LucideIcon,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/format";

type Item = { href: string; label: string; icon: LucideIcon };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Main",
    items: [
      { href: "/", label: "Home", icon: Home },
      { href: "/browse", label: "Browse", icon: FolderSearch },
      { href: "/resources", label: "Resources", icon: FileText },
      { href: "/upload", label: "Upload", icon: Upload },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/credits", label: "Credits", icon: Coins },
      { href: "/profile", label: "Profile", icon: User },
    ],
  },
  {
    title: "Info",
    items: [
      { href: "/guidelines", label: "Guidelines", icon: BookOpen },
      { href: "/feedback", label: "Feedback", icon: MessageSquare },
      { href: "/privacy", label: "Privacy", icon: Shield },
      { href: "/about", label: "About", icon: Info },
    ],
  },
];

const MOD_ITEM: Item = { href: "/mod", label: "Moderator panel", icon: ShieldCheck };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition",
        active
          ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
          : "text-zinc-700 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
      )}
    >
      <Icon size={16} className={active ? "" : "opacity-70"} />
      {item.label}
    </Link>
  );
}

export default function SideNav() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, credits")
        .eq("id", auth.user.id)
        .maybeSingle();

      setRole(profile?.role ?? "user");
      setCredits(profile?.credits ?? 0);
    })();
    // Re-read on navigation so the balance stays fresh after downloads/purchases.
  }, [supabase, pathname]);

  const isMod = role === "mod" || role === "admin";

  return (
    <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
      {credits !== null && (
        <Link
          href="/credits"
          className="mb-2 mt-1 flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-blue-50 via-white to-pink-50 p-3 transition hover:shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-800"
        >
          <span>
            <span className="block text-xs muted">Credits</span>
            <span className="block text-xl font-semibold">{credits}</span>
          </span>
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-zinc-900">
            Top up
          </span>
        </Link>
      )}

      {SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            {section.title}
          </div>
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
          </div>
        </div>
      ))}

      {isMod && (
        <div>
          <div className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Moderator
          </div>
          <NavLink item={MOD_ITEM} active={isActive(pathname, MOD_ITEM.href)} />
        </div>
      )}
    </nav>
  );
}
