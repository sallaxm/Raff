import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, GraduationCap } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Browse" };

const FEATURED_SLUG = "islamic-studies";

export default async function BrowsePage() {
  const supabase = await supabaseServer();

  const { data: colleges, error } = await supabase
    .from("colleges")
    .select("id, slug, name, institution_id");

  if (error) {
    return <main className="page-narrow"><p className="notice-error">{error.message}</p></main>;
  }

  const ordered = [...(colleges ?? [])].sort((a, b) => {
    if ((a.slug === FEATURED_SLUG) !== (b.slug === FEATURED_SLUG)) {
      return a.slug === FEATURED_SLUG ? -1 : 1;
    }
    return a.institution_id.localeCompare(b.institution_id) || a.name.localeCompare(b.name);
  });

  return (
    <main className="page-narrow">
      <div>
        <h1 className="h1">Browse</h1>
        <p className="muted">Pick your college, then your program — every course in its study plan has its own page of files.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ordered.map((c) => (
          <Link key={c.id} href={`/browse/college/${c.slug}`} className="card card-hover flex items-center gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-pink-100 text-zinc-700 dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-200">
              <GraduationCap size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{c.name}</span>
              <span className="block text-xs uppercase tracking-wide muted">
                {c.slug === FEATURED_SLUG ? "Featured · " : ""}
                {c.institution_id}
              </span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-zinc-400" />
          </Link>
        ))}
      </div>
    </main>
  );
}
