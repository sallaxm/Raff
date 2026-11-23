import Link from "next/link";
import { ArrowRight, Coins, FileText, Upload } from "lucide-react";
import HomeSearch from "./_components/HomeSearch";
import { supabaseServer } from "@/lib/supabase/server";
import { one, timeAgo } from "@/lib/format";
import { plural } from "@/lib/credits";

type Course = { code: string; name: string };

type LatestRow = {
  id: string;
  title: string;
  type: string;
  cost: number;
  page_count: number | null;
  created_at: string;
  courses: Course | Course[] | null;
};

export default async function HomePage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user ?? null;

  const [profileRes, latestRes] = await Promise.all([
    user
      ? supabase.from("profiles").select("credits").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("resources")
      .select("id, title, type, cost, page_count, created_at, courses ( code, name )")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const credits = user ? (profileRes.data?.credits ?? 0) : null;
  const latest = ((latestRes.data ?? []) as LatestRow[]).map((r) => ({
    ...r,
    course: one(r.courses),
  }));

  return (
    <main className="page">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-gradient-to-br from-pink-100/70 via-blue-100/60 to-purple-100/70 p-6 shadow-sm md:p-8 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.6),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.5),transparent_40%)] dark:opacity-10"
        />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Share smarter. Study faster.
            </h1>
            <p className="prose-body">
              Past papers, notes and assignments — organised by college, major and course.
            </p>
            <div className="pt-2">
              <HomeSearch />
            </div>
          </div>

          <div className="card w-full shrink-0 md:w-[260px]">
            <div className="flex items-center gap-2 text-sm muted">
              <Coins size={16} /> Your credits
            </div>
            <div className="mt-1 text-3xl font-semibold">{credits ?? "—"}</div>
            <div className="mt-4 flex gap-2">
              {user ? (
                <>
                  <Link href="/credits" className="btn-primary flex-1">
                    Top up
                  </Link>
                  <Link href="/upload" className="btn-secondary flex-1">
                    <Upload size={14} /> Upload
                  </Link>
                </>
              ) : (
                <Link href="/profile" className="btn-primary w-full">
                  Sign in to start
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="h2">Latest uploads</h2>
            <p className="text-sm muted">Newly approved resources</p>
          </div>
          <Link href="/resources" className="btn-ghost">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="card text-sm muted">No uploads yet — be the first!</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {latest.map((r) => (
              <Link
                key={r.id}
                href={`/resources?q=${encodeURIComponent(r.title)}`}
                className="card card-hover flex items-start gap-3 p-4"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <FileText size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{r.title}</div>
                  <div className="truncate text-sm muted">
                    {r.course ? `${r.course.code} · ${r.course.name}` : "General"} · {r.type}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {timeAgo(r.created_at)}
                    {typeof r.page_count === "number" ? ` · ${plural(r.page_count, "page")}` : ""}
                  </div>
                </div>
                <span className="badge-neutral shrink-0">{plural(r.cost, "credit")}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
