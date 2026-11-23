import Link from "next/link";
import { ArrowRight, Coins, FileText, GraduationCap, Sparkles } from "lucide-react";
import SearchBox from "./_components/SearchBox";
import CourseCard from "@/components/course/CourseCard";
import { supabaseServer } from "@/lib/supabase/server";
import { getCourseCounts, getStudentContext } from "@/lib/courses";
import { one, timeAgo } from "@/lib/format";

type Course = { id: string; code: string; name: string };

type LatestRow = {
  id: string;
  title: string;
  type: string;
  created_at: string;
  courses: Course | Course[] | null;
};

export default async function HomePage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user ?? null;

  const [profileRes, latestRes, popularRes, ctx] = await Promise.all([
    user
      ? supabase.from("profiles").select("credits, majors ( id, name, short_name )").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("resources")
      .select("id, title, type, created_at, courses ( id, code, name )")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("course_resource_counts")
      .select("course_id, resource_count")
      .order("resource_count", { ascending: false })
      .limit(6),
    getStudentContext(supabase, user?.id ?? null),
  ]);

  const credits = user ? (profileRes.data?.credits ?? 0) : null;
  const major = one(
    (profileRes.data as { majors?: { id: string; name: string; short_name: string | null } | null } | null)?.majors ?? null
  );
  const pinnedCounts = await getCourseCounts(supabase, ctx.pinned.map((c) => c.id));
  const latest = ((latestRes.data ?? []) as LatestRow[]).map(({ courses, ...r }) => ({ ...r, course: one(courses) }));
  const popularRows = (popularRes.data ?? []) as { course_id: string; resource_count: number }[];
  const { data: popularCourses } = popularRows.length
    ? await supabase.from("courses").select("id, code, name").in("id", popularRows.map((p) => p.course_id))
    : { data: [] as Course[] };
  const popular = popularRows
    .map((p) => ({ course: (popularCourses ?? []).find((c) => c.id === p.course_id), count: p.resource_count }))
    .filter((p): p is { course: Course; count: number } => Boolean(p.course));
  const pinnedIds = new Set(ctx.pinned.map((c) => c.id));

  return (
    <main className="page">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-gradient-to-br from-pink-100/70 via-blue-100/60 to-purple-100/70 p-6 shadow-sm md:p-8 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl flex-1 space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Find files for your course.</h1>
            <p className="prose-body">
              Past papers, notes and labs from UDST students, organised by course. Search a course code to start.
            </p>
            <div className="pt-1">
              <SearchBox size="lg" />
            </div>
          </div>

          <Link href={user ? "/credits" : "/profile"} className="card card-hover w-full shrink-0 md:w-[220px]">
            <div className="flex items-center gap-2 text-sm muted">
              <Coins size={16} /> {user ? "Your credits" : "New here?"}
            </div>
            <div className="mt-1 text-2xl font-semibold">{user ? credits : "Get 10 free"}</div>
            <div className="mt-1 text-xs muted">{user ? "Upload to earn more, or top up" : "Sign up — every file is 2 credits"}</div>
          </Link>
        </div>
      </section>

      {/* My courses */}
      {user && (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="h2">My courses</h2>
              <p className="text-sm muted">
                {major ? (
                  <>
                    {major.short_name ?? major.name} ·{" "}
                    <Link href={`/browse/major/${major.id}`} className="underline underline-offset-4">
                      study plan
                    </Link>
                  </>
                ) : (
                  "Pin the courses you're taking for one-tap access"
                )}
              </p>
            </div>
            {ctx.pinned.length > 0 && (
              <Link href={major ? `/browse/major/${major.id}` : "/browse"} className="btn-ghost">
                Edit <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {ctx.pinned.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {ctx.pinned.map((c) => (
                <CourseCard key={c.id} course={c} count={pinnedCounts.get(c.id) ?? 0} pinned />
              ))}
            </div>
          ) : (
            <Link
              href={major ? `/browse/major/${major.id}` : "/browse"}
              className="card card-hover flex items-center gap-4 border-dashed"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <GraduationCap size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  {major ? "Pick this semester's courses" : "Choose your program"}
                </span>
                <span className="block text-sm muted">
                  {major
                    ? "Open your study plan and tap the bookmark on each course you're taking."
                    : "We'll show your study plan year by year so you can pin your courses."}
                </span>
              </span>
              <ArrowRight size={18} className="shrink-0 text-zinc-400" />
            </Link>
          )}
        </section>
      )}

      {!user && (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { href: "/browse", icon: GraduationCap, title: "Pick your program", text: "Every UDST bachelor, diploma and master's study plan, year by year." },
            { href: "/search", icon: FileText, title: "Open a course", text: "Every past paper, note and lab for that course in one list." },
            { href: "/profile", icon: Sparkles, title: "Share & earn", text: "Earn credits every time someone downloads your upload." },
          ].map(({ href, icon: Icon, title, text }) => (
            <Link key={title} href={href} className="card card-hover">
              <Icon size={18} className="text-blue-600 dark:text-blue-400" />
              <div className="mt-2 font-semibold">{title}</div>
              <p className="mt-1 text-sm muted">{text}</p>
            </Link>
          ))}
        </section>
      )}

      {/* Popular courses */}
      {popular.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="h2">Courses with the most files</h2>
              <p className="text-sm muted">Where students are sharing the most</p>
            </div>
            <Link href="/browse" className="btn-ghost">
              All programs <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {popular.map((p) => (
              <CourseCard
                key={p.course.id}
                course={p.course}
                count={p.count}
                pinned={pinnedIds.has(p.course.id)}
                showPin={Boolean(user)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="h2">Latest uploads</h2>
            <p className="text-sm muted">Newly approved files</p>
          </div>
          <Link href="/resources" className="btn-ghost">
            All files <ArrowRight size={14} />
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="card text-sm muted">No uploads yet — be the first!</p>
        ) : (
          <ul className="card divide-y divide-zinc-100 p-0 dark:divide-zinc-800">
            {latest.map((r) => (
              <li key={r.id}>
                <Link
                  href={r.course ? `/course/${r.course.id}` : "/resources"}
                  className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                >
                  <FileText size={18} className="shrink-0 text-zinc-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{r.title}</div>
                    <div className="truncate text-xs muted">
                      {r.course ? `${r.course.code} · ${r.course.name}` : "Whole program"} · {r.type} · {timeAgo(r.created_at)}
                    </div>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-zinc-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
