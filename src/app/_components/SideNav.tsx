"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

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

export default function SideNav() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setRole(null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.user.id)
        .maybeSingle();

      setRole(profile?.role ?? "user");
    })();
  }, [supabase]);

  const isMod = role === "mod" || role === "admin";

  return (
    <nav className="px-3 space-y-1">
      <NavItem href="/" label="Home" />
      <NavItem href="/browse" label="Browse" />
      <NavItem href="/resources" label="Resources" />
      <NavItem href="/upload" label="Upload" />
      <NavItem href="/profile" label="Profile" />
      {isMod && <NavItem href="/mod" label="Mod" />}
    </nav>
  );
}