import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { RESOURCE_TYPES } from "@/lib/courses";
import { one, timeAgo } from "@/lib/format";
import { plural } from "@/lib/credits";
import DownloadButton from "@/components/course/DownloadButton";
import PinButton from "@/components/course/PinButton";
import TypeFilter from "./TypeFilter";

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> };

type Program = { id: string; name: string; short_name: string | null };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("courses").select("code, name").eq("id", id).maybeSingle();
  return { title: data ? `${data.code} ${data.name}` : "Course" };
}

export default async function CoursePage({ params, searchParams }: Params) {
  const { id } = await params;
  const { type } = await searchParams;
  const supabase = await supabaseServer();

  const [{ data: course }, { data: auth }] = await Promise.all([
    supabase.from("courses").select("id, code, name, credits").eq("id", id).maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (!course) notFound();
  const user = auth.user;

  const [{ data: resources }, { data: programs }, pinRes, ownedRes] = await Promise.all([
    supabase
      .from("resources")
      .select("id, title, type, cost, page_count, created_at, uploader_id")
      .eq("course_id", id)
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    supabase
      .from("major_courses")
      .select("year, semester, is_elective, majors ( id, name, short_name )")
      .eq("course_id", id),
    user
      ? supabase.from("user_courses").select("course_id").eq("user_id", user.id).eq("course_id", id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from("downloads").select("resource_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as { resource_id: string }[] }),
  ]);

  const files = resources ?? [];
  const owned = new Set((ownedRes.data ?? []).map((d) => d.resource_id));
  const typesPresent = RESOURCE_TYPES.filter((t) => files.some((f) => f.type === t));
  const extraTypes = [...new Set(files.map((f) => f.type))].filter((t) => !typesPresent.includes(t as never));
  const allTypes = [...typesPresent, ...extraTypes];
  const active = type && allTypes.includes(type) ? type : null;
  const shown = active ? files.filter((f) => f.type === active) : files;

  const programList = ((programs ?? []) as {
    year: number;
    semester: number;
    is_elective: boolean;
    majors: Program | Program[] | null;
  }[])
    .map((p) => ({ ...p, major: one(p.majors) }))
    .filter((p) => p.major)
    .sort((a, b) => a.year - b.year || a.major!.name.localeCompare(b.major!.name));

  return (
    <main className="page-narrow">
      <section className="card-hero space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wide text-blue-600 dark:text-blue-400">{course.code}</p>
            <h1 className="h1 mt-1">{course.name}</h1>
            <p className="mt-2 text-sm muted">
              {plural(files.length, "file")}
              {course.credits ? ` · ${plural(course.credits, "credit hour")}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PinButton courseId={course.id} pinned={Boolean(pinRes.data)} />
            <Link href={`/upload?course=${course.id}`} className="btn-secondary">
              <Upload size={16} /> Upload
            </Link>
          </div>
        </div>

        {programList.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {programList.slice(0, 8).map((p) => (
              <Link
                key={p.major!.id}
                href={`/browse/major/${p.major!.id}`}
                className="badge-neutral hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title={p.major!.name}
              >
                {p.major!.short_name ?? p.major!.name} · Year {p.year}
                {p.is_elective ? " · elective" : ""}
              </Link>
            ))}
            {programList.length > 8 && <span className="badge-neutral">+{programList.length - 8} more programs</span>}
          </div>
        )}
      </section>

      {files.length === 0 ? (
        <div className="card space-y-3 text-center">
          <FileText size={28} className="mx-auto text-zinc-300 dark:text-zinc-600" />
          <p className="font-medium">No files for {course.code} yet</p>
          <p className="text-sm muted">
            Have notes or a past paper for this course? Upload it and earn credits when it&apos;s approved.
          </p>
          <Link href={`/upload?course=${course.id}`} className="btn-primary mx-auto">
            <Upload size={16} /> Upload the first file
          </Link>
        </div>
      ) : (
        <section className="space-y-3">
          {allTypes.length > 1 && (
            <TypeFilter
              types={allTypes.map((t) => ({ type: t, count: files.filter((f) => f.type === t).length }))}
              active={active}
              total={files.length}
            />
          )}

          <ul className="card divide-y divide-zinc-100 p-0 dark:divide-zinc-800">
            {shown.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <FileText size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{r.title}</div>
                  <div className="truncate text-xs muted">
                    {r.type}
                    {typeof r.page_count === "number" ? ` · ${plural(r.page_count, "page")}` : ""} · {timeAgo(r.created_at)}
                  </div>
                </div>
                {user && r.uploader_id === user.id ? (
                  <span className="badge-neutral shrink-0">Your upload</span>
                ) : (
                  <DownloadButton resourceId={r.id} cost={r.cost} owned={owned.has(r.id)} />
                )}
              </li>
            ))}
          </ul>
          <p className="text-xs muted">
            You pay once per file and re-opening is free. Half of what you pay goes to the student who shared it. Earn credits by{" "}
            <Link href={`/upload?course=${course.id}`} className="underline underline-offset-4">
              uploading
            </Link>{" "}
            or{" "}
            <Link href="/credits" className="underline underline-offset-4">
              top up
            </Link>
            .
          </p>
        </section>
      )}
    </main>
  );
}
