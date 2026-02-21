import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function BrowsePage() {
  const supabase = await supabaseServer();

  const { data: colleges, error } = await supabase
    .from("colleges")
    .select("id, slug, name, institution_id")
    .order("institution_id")
    .order("name");

  if (error) return <main className="p-6">Error: {error.message}</main>;

  const orderedColleges = [...(colleges ?? [])].sort((a, b) => {
    if (a.slug === "islamic-studies" && b.slug !== "islamic-studies") return -1;
    if (b.slug === "islamic-studies" && a.slug !== "islamic-studies") return 1;
    if (a.institution_id !== b.institution_id) {
      return a.institution_id.localeCompare(b.institution_id);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-semibold">Browse</h1>
      <p className="text-zinc-500">Pick a college</p>

      <div className="space-y-3">
        {orderedColleges.map((c) => (
          <Link
            key={c.id}
            href={`/browse/college/${c.slug}`}
            className="
              block p-5 rounded-3xl border border-zinc-200 bg-white shadow-sm
              hover:shadow-md transition
              dark:bg-zinc-900 dark:border-zinc-800
            "
          >
            <div className="text-lg font-semibold">{c.name}</div>
            <div className="text-sm text-zinc-500">
              {c.slug === "islamic-studies" ? "Featured • " : ""}
              {c.institution_id.toUpperCase()}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}