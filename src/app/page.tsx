import Link from "next/link";
import HomeSearch from "./_components/HomeSearch";
import { supabaseServer } from "@/lib/supabase/server";

type LatestResource = {
  id: string;
  title: string;
  type: string;
  cost: number;
  page_count: number | null;
  created_at: string;
  courses: { code: string; name: string } | null;
};

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.max(1, Math.floor((now - d) / 1000));

  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;

  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export default async function HomePage() {
  const supabase = await supabaseServer();

  const { data: u } = await supabase.auth.getUser();
  const user = u.user ?? null;

  let credits: number | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .maybeSingle();

    credits = profile?.credits ?? 0;
  }

  const { data: latest } = await supabase
    .from("resources")
    .select(
      `
      id,
      title,
      type,
      cost,
      page_count,
      created_at,
      courses (
        code,
        name
      )
    `
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(12);

  const latestRows = (latest ?? []) as LatestResource[];

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      
      {/* HERO */}
      <section
        className="
          relative overflow-hidden backdrop-blur-xl
          rounded-[32px] p-6 md:p-8
          border border-zinc-200
          shadow-sm

          bg-gradient-to-br 
          from-pink-100/70 
          via-blue-100/60 
          to-purple-100/70

          dark:from-zinc-900
          dark:via-zinc-900
          dark:to-zinc-800
        "
      >
        {/* Glass glow overlay */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.6),transparent_40%),
                radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.5),transparent_40%)]
          "
        />

        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          
          {/* LEFT */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Share smarter. Study faster.
            </h1>

            <p className="text-zinc-600 dark:text-zinc-300 max-w-xl">
              Past papers, notes, assignments — organized by college, major, and course.
            </p>

            <div className="mt-4 max-w-md">
              <HomeSearch />
            </div>
          </div>

          {/* RIGHT — Credits card */}
          <div
            className="
              shrink-0 w-full md:w-[280px]
              rounded-3xl p-4
              bg-white/70 backdrop-blur-xl
              border border-white/40
              shadow-sm

              dark:bg-zinc-900/70
              dark:border-zinc-800
            "
          >
            <div className="text-sm text-zinc-500">
              Your credits
            </div>

            <div className="text-2xl font-semibold mt-1">
              {user ? credits : "Sign in"}
            </div>

            <div className="mt-3 flex gap-2">
              <Link
                href="/profile"
                className="
                  px-4 py-2 rounded-2xl
                  bg-black text-white text-sm
                  hover:opacity-90 transition
                  dark:bg-white dark:text-black
                "
              >
                {user ? "Profile" : "Sign in"}
              </Link>

              <Link
                href="/upload"
                className="
                  px-4 py-2 rounded-2xl
                  border border-zinc-200 text-sm
                  hover:bg-zinc-50 transition
                  dark:border-zinc-800 dark:hover:bg-zinc-900
                "
              >
                Upload
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* LATEST */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Latest uploads
            </h2>
            <p className="text-zinc-500 text-sm">
              Newly approved resources
            </p>
          </div>

          <Link
            href="/resources"
            className="
              text-sm text-zinc-600
              hover:text-zinc-900
              dark:text-zinc-300
              dark:hover:text-white
            "
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {latestRows.map((r) => (
            <Link
              key={r.id}
              href="/resources"
              className="
                block rounded-3xl
                border border-zinc-200
                bg-white p-4 shadow-sm
                hover:shadow-md transition

                dark:bg-zinc-900
                dark:border-zinc-800
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {r.title}
                  </div>

                  <div className="text-sm text-zinc-500 truncate">
                    {r.courses?.code
                      ? `${r.courses.code} • ${r.courses.name}`
                      : "Course"}{" "}
                    • {r.type}
                  </div>

                  <div className="text-xs text-zinc-400 mt-1">
                    {r.created_at ? timeAgo(r.created_at) : ""}
                    {typeof r.page_count === "number"
                      ? ` • ${r.page_count} pages`
                      : ""}
                  </div>
                </div>

                <div className="text-sm font-semibold shrink-0">
                  {r.cost} credits
                </div>
              </div>
            </Link>
          ))}
        </div>

        {(latest ?? []).length === 0 && (
          <p className="text-sm text-zinc-500">
            No uploads yet.
          </p>
        )}
      </section>

    </main>
  );
}