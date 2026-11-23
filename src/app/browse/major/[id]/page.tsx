import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { getCourseCounts, getStudentContext } from "@/lib/courses";
import { one } from "@/lib/format";
import SetProgramButton from "@/components/course/SetProgramButton";
import StudyPlan, { type PlanRow } from "./StudyPlan";

type Params = { params: Promise<{ id: string }> };

type Course = { id: string; code: string; name: string; credits: number | null };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("majors").select("name").eq("id", id).maybeSingle();
  return { title: data?.name ?? "Program" };
}

export default async function MajorPage({ params }: Params) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const [{ data: major }, { data: auth }] = await Promise.all([
    supabase
      .from("majors")
      .select("id, name, short_name, source_url, plan_year, colleges ( slug, name )")
      .eq("id", id)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (!major) notFound();

  const { data, error } = await supabase
    .from("major_courses")
    .select("year, semester, is_elective, elective_group, courses ( id, code, name, credits )")
    .eq("major_id", major.id);

  if (error) {
    return (
      <main className="page-narrow">
        <p className="notice-error">{error.message}</p>
      </main>
    );
  }

  const rows: PlanRow[] = ((data ?? []) as {
    year: number;
    semester: number;
    is_elective: boolean;
    elective_group: string | null;
    courses: Course | Course[] | null;
  }[])
    .map((r) => ({ ...r, course: one(r.courses) }))
    .filter((r): r is typeof r & { course: Course } => Boolean(r.course))
    .map((r) => ({
      year: r.year,
      term: r.semester,
      elective: r.is_elective,
      group: r.elective_group,
      course: r.course,
      count: 0,
    }));

  const [counts, ctx] = await Promise.all([
    getCourseCounts(supabase, rows.map((r) => r.course.id)),
    getStudentContext(supabase, auth.user?.id ?? null),
  ]);
  for (const r of rows) r.count = counts.get(r.course.id) ?? 0;
  const college = one(major.colleges as { slug: string; name: string } | { slug: string; name: string }[] | null);

  return (
    <main className="page-narrow">
      <section className="card-hero space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {college && (
              <Link href={`/browse/college/${college.slug}`} className="inline-flex items-center gap-1 text-sm muted hover:underline">
                <ArrowLeft size={14} /> {college.name}
              </Link>
            )}
            <h1 className="h1 mt-1">{major.name}</h1>
            <p className="mt-1 text-sm muted">
              {[major.short_name, major.plan_year && `${major.plan_year} study plan`, `${rows.length} courses`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {auth.user && <SetProgramButton majorId={major.id} isMine={ctx.majorId === major.id} />}
          {major.source_url && (
            <a href={major.source_url} target="_blank" rel="noreferrer" className="btn-ghost">
              Official plan <ExternalLink size={14} />
            </a>
          )}
        </div>
      </section>

      {rows.length === 0 ? (
        <p className="card text-sm muted">The study plan for this program hasn&apos;t been added yet.</p>
      ) : (
        <StudyPlan rows={rows} pinnedIds={ctx.pinned.map((c) => c.id)} signedIn={Boolean(auth.user)} />
      )}
    </main>
  );
}
