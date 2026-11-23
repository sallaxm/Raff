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

  const { data: majors, error: majorsError } = await supabase
    .from("majors")
    .select("id, name")
    .eq("college_id", college.id)
    .order("name");

  return (
    <main className="page-narrow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="h1">{college.name}</h1>
          <p className="muted">Choose a major</p>
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
              <span className="font-semibold">{m.name}</span>
              <ChevronRight size={18} className="shrink-0 text-zinc-400" />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
