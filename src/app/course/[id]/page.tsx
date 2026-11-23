import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { plural } from "@/lib/credits";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: course } = await supabase
    .from("courses")
    .select("id, code, name")
    .eq("id", id)
    .maybeSingle();

  if (!course) notFound();

  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, type, cost, page_count")
    .eq("course_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <main className="page-narrow">
      <section className="card-hero">
        <p className="text-sm font-medium muted">{course.code}</p>
        <h1 className="h1 mt-1">{course.name}</h1>
        <p className="mt-2 text-sm muted">{plural(resources?.length ?? 0, "resource")}</p>
      </section>

      {!resources?.length ? (
        <p className="card text-sm muted">
          No resources yet.{" "}
          <Link href="/upload" className="underline underline-offset-4">
            Upload the first one →
          </Link>
        </p>
      ) : (
        <div className="space-y-2">
          {resources.map((r) => (
            <Link
              key={r.id}
              href={`/resources?q=${encodeURIComponent(r.title)}`}
              className="card card-hover flex items-center gap-3 p-4"
            >
              <FileText size={18} className="shrink-0 text-zinc-400" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{r.title}</div>
                <div className="text-sm muted">
                  {r.type}
                  {typeof r.page_count === "number" ? ` · ${plural(r.page_count, "page")}` : ""}
                </div>
              </div>
              <span className="badge-neutral shrink-0">{plural(r.cost, "credit")}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
