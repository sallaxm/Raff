"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, FileText, Loader2, Search, Trash2, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { one } from "@/lib/format";
import { plural } from "@/lib/credits";

type SortKey = "newest" | "cheapest" | "expensive";

type Course = { id: string; code: string; name: string };

type ResourceRow = {
  id: string;
  title: string;
  type: string;
  cost: number;
  page_count: number | null;
  created_at: string;
  courses: Course | Course[] | null;
};

type ResourceItem = Omit<ResourceRow, "courses"> & { course: Course | null };

type Notice = { kind: "info" | "error" | "credits"; text: string } | null;

const TYPES = ["Past Paper", "Notes", "Assignment", "Lab", "Cheat Sheet", "Summary", "Other"];

const SORTS: Record<SortKey, { column: "created_at" | "cost"; ascending: boolean }> = {
  newest: { column: "created_at", ascending: false },
  cheapest: { column: "cost", ascending: true },
  expensive: { column: "cost", ascending: false },
};

/** Escape LIKE wildcards so a search for "100%" matches literally. */
function likePattern(q: string) {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export default function ResourcesClient() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const searchParams = useSearchParams();

  const [credits, setCredits] = useState<number | null>(null);
  const [isMod, setIsMod] = useState(false);
  const [type, setType] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const loadProfile = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setCredits(null);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits, role")
      .eq("id", auth.user.id)
      .maybeSingle();
    setCredits(profile?.credits ?? 0);
    setIsMod(profile?.role === "mod" || profile?.role === "admin");
  }, [supabase]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // Debounced search / filter
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const { column, ascending } = SORTS[sort];

      let query = supabase
        .from("resources")
        .select("id, title, type, cost, page_count, created_at, courses ( id, code, name )")
        .eq("status", "approved");

      if (type !== "all") query = query.eq("type", type);
      if (q.trim()) query = query.ilike("title", likePattern(q.trim()));

      const { data, error } = await query
        .order(column, { ascending })
        .order("created_at", { ascending: false })
        .limit(100);

      if (cancelled) return;
      if (error) setNotice({ kind: "error", text: error.message });
      setItems(((data ?? []) as ResourceRow[]).map(({ courses, ...r }) => ({ ...r, course: one(courses) })));
      setLoading(false);
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [supabase, type, sort, q]);

  async function openDownload(resourceId: string) {
    const res = await fetch(`/api/download/${resourceId}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Could not start download");

    if (!window.open(json.url, "_blank", "noopener,noreferrer")) {
      setNotice({ kind: "info", text: "Your browser blocked the new tab — allow pop-ups and use Profile → Downloaded." });
      return;
    }
    setNotice({ kind: "info", text: "Download started in a new tab." });
  }

  async function download(item: ResourceItem) {
    setNotice(null);

    if (credits === null) {
      setNotice({ kind: "error", text: "Please log in on the Profile page to download." });
      return;
    }

    setBusyId(item.id);
    try {
      const { error } = await supabase.rpc("spend_credits_and_log_download", {
        p_resource_id: item.id,
      });

      if (error) {
        const message = error.message;
        if (message.includes("Insufficient credits")) {
          setNotice({ kind: "credits", text: `You need ${plural(item.cost, "credit")} for this file.` });
          return;
        }
        // Already paid → just hand out the file again.
        if (!message.includes("Already downloaded")) {
          setNotice({ kind: "error", text: message.replace(/^.*failed: /, "") });
          return;
        }
      }

      await loadProfile();
      await openDownload(item.id);
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : "Download failed" });
    } finally {
      setBusyId(null);
    }
  }

  async function deleteResource(resourceId: string) {
    if (!confirm("Delete this resource and its file? This cannot be undone.")) return;

    setNotice(null);
    setBusyId(resourceId);
    try {
      const res = await fetch(`/api/mod/resource/${resourceId}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ kind: "error", text: json?.error || "Failed to delete resource" });
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== resourceId));
      setNotice({ kind: "info", text: "Resource deleted." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="h1">All files</h1>
          <p className="muted">
            Every approved upload. Looking for one course?{" "}
            <Link href="/search" className="underline underline-offset-4">
              Search by course code
            </Link>
            .
          </p>
        </div>

        <Link href={credits === null ? "/profile" : "/credits"} className="card card-hover px-5 py-3">
          <div className="text-xs muted">Your credits</div>
          <div className="text-2xl font-semibold">{credits ?? "Sign in"}</div>
        </Link>
      </div>

      {/* Search + filters */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="input flex items-center gap-2 md:col-span-2">
          <Search size={16} className="shrink-0 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title…"
            aria-label="Search by title"
            className="w-full bg-transparent outline-none"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="text-zinc-400 hover:text-zinc-600">
              <X size={16} />
            </button>
          )}
        </label>

        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
          <option value="all">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="cheapest">Cheapest</option>
          <option value="expensive">Most expensive</option>
        </select>
      </div>

      {notice && (
        <div className={notice.kind === "error" ? "notice-error" : "notice"}>
          {notice.text}
          {notice.kind === "credits" && (
            <>
              {" "}
              <Link href="/credits" className="font-semibold underline underline-offset-4">
                Top up credits →
              </Link>
            </>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-[92px] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="card text-sm muted">No matches. Try a different search or filter.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((r) => (
            <div key={r.id} className="card flex items-start gap-3 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <FileText size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{r.title}</div>
                <div className="truncate text-sm muted">
                  {r.course ? (
                    <Link href={`/course/${r.course.id}`} className="hover:underline">
                      {r.course.code} · {r.course.name}
                    </Link>
                  ) : (
                    "Whole program"
                  )}{" "}
                  · {r.type}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  {typeof r.page_count === "number" ? `${plural(r.page_count, "page")} · ` : ""}
                  {plural(r.cost, "credit")}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <button
                  type="button"
                  onClick={() => download(r)}
                  disabled={busyId === r.id}
                  className="btn-primary"
                >
                  {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Get
                </button>
                {isMod && (
                  <button
                    type="button"
                    onClick={() => deleteResource(r.id)}
                    disabled={busyId === r.id}
                    className="btn-danger"
                    aria-label={`Delete ${r.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
