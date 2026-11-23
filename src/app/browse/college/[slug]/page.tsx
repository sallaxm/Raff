import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";

export default async function CollegeMajorsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await supabaseServer();

  const { data: college, error } = await supabase
    .from("colleges")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return <main className="page-narrow"><p className="notice-error">{error.message}</p></main>;
  }
  if (!college) notFound();

  const { data: majorRows, error: majorsError } = await supabase
    .from("majors")
    .select("id, name, short_name, major_courses ( count )")
    .eq("college_id", college.id)
    .order("name");

  const majors = (majorRows ?? []).map((m) => ({
    id: m.id as string,
    name: m.name as string,
    shortName: (m.short_name as string | null) ?? null,
    courses: ((m.major_courses as { count: number }[] | null)?.[0]?.count ?? 0) as number,
  }));

  return (
    <main className="page-narrow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="h1">{college.name}</h1>
          <p className="muted">Choose your program to see its study plan</p>
        </div>
        <Link href="/browse" className="btn-secondary">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      {majorsError && <p className="notice-error">{majorsError.message}</p>}

      {!majors?.length ? (
        <p className="card text-sm muted">No majors found.</p>
      ) : (
        <div className="space-y-2">
          {majors.map((m) => (
            <Link key={m.id} href={`/browse/major/${m.id}`} className="card card-hover flex items-center justify-between gap-4 py-4">
              <span className="min-w-0">
                <span className="block font-semibold">{m.name}</span>
                <span className="block text-xs muted">
                  {[m.shortName, m.courses ? `${m.courses} courses` : "Study plan coming soon"].filter(Boolean).join(" · ")}
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-zinc-400" />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
