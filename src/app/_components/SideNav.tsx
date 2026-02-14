"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

function Section({ title }: { title: string }) {
  return (
    <div className="pt-4 pb-1 px-3 text-[11px] font-semibold tracking-wider text-zinc-400">
      {title}
    </div>
  );
}

function Dot() {
  return <span className="opacity-60">•</span>;
}

function NavItem({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={() => onNavigate?.()}
      className="
        flex items-center gap-2
        px-3 py-2 rounded-2xl
        text-sm text-zinc-700
        hover:bg-white/60 transition
        dark:text-zinc-200 dark:hover:bg-zinc-800/60
      "
    >
      <Dot />
      {label}
    </Link>
  );
}

export default function SideNav() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  // Mobile drawer open/close (only matters on mobile)
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, credits")
        .eq("id", u.user.id)
        .maybeSingle();

      setRole(profile?.role ?? "user");
      setCredits(profile?.credits ?? 0);
    })();
  }, [supabase]);

  const isMod = role === "mod" || role === "admin";

  // Close drawer after navigation (mobile only)
  function closeMobile() {
    setMobileOpen(false);
  }

  // Also close drawer whenever route changes (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* MOBILE: top button to open nav */}
      <div className="md:hidden px-4 pt-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="
            w-full px-4 py-3 rounded-2xl text-sm
            bg-white/70 dark:bg-zinc-900/70
            border border-zinc-200 dark:border-zinc-800
            backdrop-blur-xl
          "
        >
          Menu
        </button>
      </div>

      {/* MOBILE: overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={closeMobile}
        />
      )}

      {/* MOBILE: drawer */}
      <aside
        className={`
          md:hidden fixed z-50 top-0 left-0 h-full w-[86%] max-w-[320px]
          bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl
          border-r border-white/40 dark:border-zinc-800
          shadow-[0_10px_40px_rgba(0,0,0,0.20)]
          transform transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="font-semibold">Raff</div>
          <button
            onClick={closeMobile}
            className="px-3 py-2 rounded-2xl text-sm hover:bg-white/60 dark:hover:bg-zinc-800/60"
          >
            Close
          </button>
        </div>

        <nav className="px-2 pb-4 overflow-y-auto overscroll-contain">
          {/* CREDIT CARD */}
          {credits !== null && (
            <div
              className="
                mt-2 mx-2 p-3 rounded-2xl
                bg-gradient-to-br from-blue-50 via-white to-pink-50
                dark:from-zinc-900 dark:to-zinc-800
                border border-zinc-200 dark:border-zinc-800
                text-sm
              "
            >
              <div className="text-xs text-zinc-500">Credits</div>
              <div className="text-xl font-semibold">{credits}</div>
            </div>
          )}

          <Section title="MAIN" />
          <NavItem href="/" label="Home" onNavigate={closeMobile} />
          <NavItem href="/browse" label="Browse" onNavigate={closeMobile} />
          <NavItem href="/resources" label="Resources" onNavigate={closeMobile} />
          <NavItem href="/upload" label="Upload" onNavigate={closeMobile} />

          <Section title="ACCOUNT" />
          <NavItem href="/credits" label="Credits" onNavigate={closeMobile} />
          <NavItem href="/profile" label="Profile" onNavigate={closeMobile} />

          <Section title="INFO" />
          <NavItem href="/guidelines" label="Guidelines" onNavigate={closeMobile} />
          <NavItem href="/feedback" label="Feedback" onNavigate={closeMobile} />
          <NavItem href="/privacy" label="Privacy" onNavigate={closeMobile} />
          <NavItem href="/about" label="About" onNavigate={closeMobile} />

          {isMod && (
            <>
              <Section title="MODERATOR" />
              <NavItem href="/mod" label="Moderator Panel" onNavigate={closeMobile} />
            </>
          )}
        </nav>
      </aside>

      {/* DESKTOP: your original sidebar nav content (unchanged behavior) */}
      <nav className="hidden md:block px-2 pb-4 overflow-y-auto overscroll-contain">
        {/* CREDIT CARD */}
        {credits !== null && (
          <div
            className="
              mt-4 mx-2 p-3 rounded-2xl
              bg-gradient-to-br from-blue-50 via-white to-pink-50
              dark:from-zinc-900 dark:to-zinc-800
              border border-zinc-200 dark:border-zinc-800
              text-sm
            "
          >
            <div className="text-xs text-zinc-500">Credits</div>
            <div className="text-xl font-semibold">{credits}</div>
          </div>
        )}

        <Section title="MAIN" />
        <NavItem href="/" label="Home" />
        <NavItem href="/browse" label="Browse" />
        <NavItem href="/resources" label="Resources" />
        <NavItem href="/upload" label="Upload" />

        <Section title="ACCOUNT" />
        <NavItem href="/credits" label="Credits" />
        <NavItem href="/profile" label="Profile" />

        <Section title="INFO" />
        <NavItem href="/guidelines" label="Guidelines" />
        <NavItem href="/feedback" label="Feedback" />
        <NavItem href="/privacy" label="Privacy" />
        <NavItem href="/about" label="About" />

        {isMod && (
          <>
            <Section title="MODERATOR" />
            <NavItem href="/mod" label="Moderator Panel" />
          </>
        )}
      </nav>
    </>
  );
}