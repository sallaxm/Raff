"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Row = {
  id: string;
  title: string;
  type: string;
  cost: number;
  page_count: number | null;
  created_at: string;
  rejected_reason: string | null;
  uploader_id: string | null;
  course_id: string | null;
  courses?: { code: string; name: string } | null;
};

export default function ModClient() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [reason, setReason] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    setMsg("");

    // Note: server page already gated access; this is extra safety.
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setMsg("Login first at /profile");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("resources")
      .select(
        `
        id,title,type,cost,page_count,created_at,status,rejected_reason,uploader_id,course_id,
        courses ( code, name )
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) setMsg(error.message);
    setRows((data as any[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function approve(id: string) {
    setMsg("");
    const { error } = await supabase.rpc("approve_resource", { p_resource_id: id });
    if (error) return setMsg(error.message);
    setMsg("Approved ✅");
    await load();
  }

  async function reject(id: string) {
    setMsg("");
    const r = (reason[id] ?? "").trim();
    const { error } = await supabase.rpc("reject_resource", {
      p_resource_id: id,
      p_reason: r || "Rejected",
    });
    if (error) return setMsg(error.message);
    setMsg("Rejected ❌");
    await load();
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Moderator</h1>
          <p className="text-zinc-500">Review pending uploads</p>
        </div>

        <button
          onClick={load}
          className="
            px-4 py-2 rounded-2xl border border-zinc-200 text-sm
            hover:bg-zinc-50 transition
            dark:border-zinc-800 dark:hover:bg-zinc-900
          "
        >
          Refresh
        </button>
      </div>

      {msg && <p className="text-sm text-zinc-600 dark:text-zinc-300">{msg}</p>}
      {loading && <p className="text-sm text-zinc-500">Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="
              rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm
              dark:bg-zinc-900 dark:border-zinc-800
            "
          >
            <div className="space-y-1">
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-zinc-500">
                {r.courses?.code ? `${r.courses.code} • ${r.courses.name}` : "Course"} • {r.type}
              </div>
              <div className="text-xs text-zinc-400">
                cost {r.cost}
                {typeof r.page_count === "number" ? ` • ${r.page_count} pages` : ""}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => approve(r.id)}
                className="
                  px-4 py-2 rounded-2xl bg-black text-white text-sm
                  hover:opacity-90 transition
                  dark:bg-white dark:text-black
                "
              >
                Approve
              </button>

              <button
                onClick={() => reject(r.id)}
                className="
                  px-4 py-2 rounded-2xl border border-zinc-200 text-sm
                  hover:bg-zinc-50 transition
                  dark:border-zinc-800 dark:hover:bg-zinc-900
                "
              >
                Reject
              </button>
            </div>

            <div className="mt-2">
              <input
                value={reason[r.id] ?? ""}
                onChange={(e) => setReason((prev) => ({ ...prev, [r.id]: e.target.value }))}
                placeholder="Reject reason (optional)"
                className="
                  w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm
                  dark:bg-zinc-900 dark:border-zinc-800
                "
              />
            </div>
          </div>
        ))}
      </div>

      {!loading && rows.length === 0 && <p className="text-sm text-zinc-500">No pending uploads 🎉</p>}
    </main>
  );
}