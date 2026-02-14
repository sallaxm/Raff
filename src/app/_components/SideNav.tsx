"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

function Section({ title }: { title: string }) {
  return (
    <div className="pt-4 pb-1 px-3 text-[11px] font-semibold tracking-wider text-zinc-400">
      {title}
    </div>
  );
}

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
      <span className="opacity-60">•</span>
      {label}
    </Link>
  );
}

export default function SideNav() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [role, setRole] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

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

  return (
    <nav className="px-2 pb-4 overflow-y-auto">

      {/* CREDIT CARD */}
      {credits !== null && (
        <div className="
          mt-4 mx-2 p-3 rounded-2xl
          bg-gradient-to-br from-blue-50 via-white to-pink-50
          dark:from-zinc-900 dark:to-zinc-800
          border border-zinc-200 dark:border-zinc-800
          text-sm
        ">
          <div className="text-xs text-zinc-500">
            Credits
          </div>

          <div className="text-xl font-semibold">
            {credits}
          </div>
        </div>
      )}

      {/* MAIN */}
      <Section title="MAIN" />
      <NavItem href="/" label="Home" />
      <NavItem href="/browse" label="Browse" />
      <NavItem href="/resources" label="Resources" />
      <NavItem href="/upload" label="Upload" />

      {/* ACCOUNT */}
      <Section title="ACCOUNT" />
      <NavItem href="/credits" label="Credits" />
      <NavItem href="/profile" label="Profile" /> 

      {/* MOD */}
      {isMod && (
        <>
          <Section title="MODERATOR" />
          <NavItem href="/mod" label="Moderator Panel" />
        </>
      )}
    </nav>
  );
}