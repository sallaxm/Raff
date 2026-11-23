import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { getCourseCounts, getStudentContext, likePattern, normaliseCode } from "@/lib/courses";
import { one, timeAgo } from "@/lib/format";
import { plural } from "@/lib/credits";
import CourseCard from "@/components/course/CourseCard";
import SearchBox from "@/app/_components/SearchBox";

export const metadata: Metadata = { title: "Search" };

type Course = { id: string; code: string; name: string };
type FileRow = {
  id: string;
  title: string;
  type: string;
  created_at: string;
  courses: Course | Course[] | null;
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  let courses: Course[] = [];
  let files: (Omit<FileRow, "courses"> & { course: Course | null })[] = [];

  if (q) {
    const code = normaliseCode(q);
    const [byCode, byName, fileRes] = await Promise.all([
      supabase.from("courses").select("id, code, name").ilike("code", `${code.replace(/[\\%_]/g, "")}%`).order("code").limit(30),
      supabase.from("courses").select("id, code, name").ilike("name", likePattern(q)).order("code").limit(30),
      supabase
        .from("resources")
        .select("id, title, type, created_at, courses ( id, code, name )")
        .eq("status", "approved")
        .ilike("title", likePattern(q))
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    const seen = new Set<string>();
    for (const c of [...(byCode.data ?? []), ...(byName.data ?? [])]) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        courses.push(c);
      }
    }
    courses = courses.slice(0, 30);
    files = ((fileRes.data ?? []) as FileRow[]).map(({ courses: c, ...f }) => ({ ...f, course: one(c) }));
  }

  const [counts, ctx] = await Promise.all([
    getCourseCounts(supabase, courses.map((c) => c.id)),
    getStudentContext(supabase, auth.user?.id ?? null),
  ]);
  const pinned = new Set(ctx.pinned.map((c) => c.id));

  // Courses with files first, then alphabetical
  courses.sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || a.code.localeCompare(b.code));

  return (
    <main className="page-narrow">
      <div className="space-y-3">
        <h1 className="h1">Search</h1>
        <SearchBox defaultValue={q} autoFocus={!q} />
      </div>

      {!q ? (
        <p className="card text-sm muted">
          Search by course code (<span className="font-medium">MATH1030</span>), course name
          (<span className="font-medium">Calculus</span>) or file title.
        </p>
      ) : (
        <>
          <section className="space-y-2">
            <h2 className="h2">Courses</h2>
            {courses.length === 0 ? (
              <p className="text-sm muted">No courses match “{q}”.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {courses.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    count={counts.get(c.id) ?? 0}
                    pinned={pinned.has(c.id)}
                    showPin={Boolean(auth.user)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="h2">Files</h2>
            {files.length === 0 ? (
              <p className="text-sm muted">No file titles match “{q}”. Try the course code instead.</p>
            ) : (
              <ul className="card divide-y divide-zinc-100 p-0 dark:divide-zinc-800">
                {files.map((f) => (
                  <li key={f.id}>
                    <Link
                      href={f.course ? `/course/${f.course.id}` : "/resources"}
                      className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    >
                      <FileText size={18} className="shrink-0 text-zinc-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{f.title}</div>
                        <div className="truncate text-xs muted">
                          {f.course ? `${f.course.code} · ${f.course.name}` : "Whole program"} · {f.type} · {timeAgo(f.created_at)}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs muted">
              {plural(files.length, "file")} shown.{" "}
              <Link href="/resources" className="underline underline-offset-4">
                Browse all files →
              </Link>
            </p>
          </section>
        </>
      )}
    </main>
  );
}
