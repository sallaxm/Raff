"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type SortKey = "newest" | "cheapest" | "expensive";

type ResourceItem = {
  id: string;
  title: string;
  type: string;
  cost: number;
  page_count: number | null;
  created_at: string;
  course_id: string | null;
  courses: { id: string; code: string; name: string } | null;
};

export default function ResourcesPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const searchParams = useSearchParams();

  const [msg, setMsg] = useState("");
  const [credits, setCredits] = useState<number | null>(null);

  const [type, setType] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [q, setQ] = useState<string>(searchParams.get("q") ?? "");

  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load credits
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setCredits(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", u.user.id)
        .single();

      setCredits(profile?.credits ?? 0);
    })();
  }, [supabase]);

  async function load() {
    setLoading(true);
    setMsg("");

    let query = supabase
      .from("resources")
      .select(
        `
        id,title,type,cost,page_count,created_at,course_id,
        courses ( id, code, name )
      `
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (type !== "all") query = query.eq("type", type);

    const trimmed = q.trim();
    if (trimmed) {
      query = query.ilike("title", `%${trimmed}%`);
    }

    if (sort === "newest") query = query.order("created_at", { ascending: false });
    if (sort === "cheapest") query = query.order("cost", { ascending: true });
    if (sort === "expensive") query = query.order("cost", { ascending: false });

    const { data, error } = await query.limit(100);

    if (error) setMsg(error.message);
    setItems((data ?? []) as ResourceItem[]);
    setLoading(false);
  }

  // Auto-load on filter/search changes
  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, sort, q]);

  async function refreshCredits() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return setCredits(null);
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", u.user.id)
      .single();
    setCredits(profile?.credits ?? credits ?? 0);
  }

  async function download(resourceId: string) {
    setMsg("");

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return setMsg("Login first at /profile");

    const { error } = await supabase.rpc("spend_credits_and_log_download", {
      p_resource_id: resourceId,
    });
    if (error) return setMsg(error.message);

    await refreshCredits();

    const res = await fetch(`/api/download/${resourceId}`);
    const json = await res.json();
    if (!res.ok) return setMsg(json.error || "Could not start download");

    const newTab = window.open(json.url, "_blank", "noopener,noreferrer");
    if (!newTab) {
      setMsg("Download started, but your browser blocked opening a new tab.");
      return;
    }

    setMsg("Starting download in a new tab…");
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Resources</h1>
          <p className="text-zinc-500">Search and download approved uploads</p>
        </div>

        <div
          className="
            rounded-3xl p-4 border border-zinc-200 bg-white shadow-sm
            dark:bg-zinc-900 dark:border-zinc-800
          "
        >
          <div className="text-sm text-zinc-500">Your credits</div>
          <div className="text-2xl font-semibold">{credits ?? "Sign in"}</div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div
          className="
            md:col-span-2 flex items-center gap-2 rounded-2xl border border-zinc-200
            bg-white px-3 py-2 shadow-sm
            dark:bg-zinc-900 dark:border-zinc-800
          "
        >
          <span className="text-zinc-400">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title…"
            className="w-full bg-transparent outline-none text-sm"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-xs px-2 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 transition dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              Clear
            </button>
          )}
        </div>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="
            rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm text-sm
            dark:bg-zinc-900 dark:border-zinc-800
          "
        >
          <option value="all">All types</option>
          <option value="Past Paper">Past Paper</option>
          <option value="Notes">Notes</option>
          <option value="Assignment">Assignment</option>
          <option value="Lab">Lab</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="
            rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm text-sm
            dark:bg-zinc-900 dark:border-zinc-800
          "
        >
          <option value="newest">Newest</option>
          <option value="cheapest">Cheapest</option>
          <option value="expensive">Most expensive</option>
        </select>
      </div>

      {msg && <p className="text-sm text-zinc-600 dark:text-zinc-300">{msg}</p>}
      {loading && <p className="text-sm text-zinc-500">Loading…</p>}

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((r) => (
          <div
            key={r.id}
            className="
              rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm
              dark:bg-zinc-900 dark:border-zinc-800
            "
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">{r.title}</div>
                <div className="text-sm text-zinc-500 truncate">
                  {r.courses?.code ? `${r.courses.code} • ${r.courses.name}` : "Course"} • {r.type}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {typeof r.page_count === "number" ? `${r.page_count} pages • ` : ""}
                  cost {r.cost}
                </div>
              </div>

              <button
                onClick={() => download(r.id)}
                className="
                  shrink-0 px-4 py-2 rounded-2xl bg-black text-white text-sm
                  hover:opacity-90 transition
                  dark:bg-white dark:text-black
                "
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <p className="text-sm text-zinc-500">No matches. Try changing filters.</p>
      )}
    </main>
  );
}
