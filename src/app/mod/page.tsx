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
  uploader_id: string | null;
  course_id: string | null;
  courses?: { code: string; name: string } | null;
};

const TYPES = ["Past Paper", "Notes", "Assignment", "Lab", "Other"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl p-5 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {children}
    </div>
  );
}

export default function ModPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);

  // Preview state per resource
  const [openPreviewId, setOpenPreviewId] = useState<string | null>(null);
  const [previewUrlById, setPreviewUrlById] = useState<Record<string, string>>({});
  const [previewLoadingById, setPreviewLoadingById] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    setMsg("");

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setMsg("Login first.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("resources")
      .select(
        `
        id,title,type,cost,page_count,created_at,uploader_id,course_id,
        courses ( code, name )
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) setMsg(error.message);

    const safe = (data ?? []) as Row[];
    setRows(safe);
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
    setEditingId(null);
    setDraft(null);
    setOpenPreviewId(null);
    load();
  }

  async function reject(id: string) {
    setMsg("");
    const reason = (prompt("Reject reason?") || "Rejected").trim();

    const { error } = await supabase.rpc("reject_resource", {
      p_resource_id: id,
      p_reason: reason || "Rejected",
    });

    if (error) return setMsg(error.message);

    setMsg("Rejected ❌");
    setEditingId(null);
    setDraft(null);
    setOpenPreviewId(null);
    load();
  }

  async function saveEdit() {
    if (!draft) return;

    const title = (draft.title ?? "").trim();
    if (!title) return setMsg("Title cannot be empty.");

    const pages = Number(draft.page_count ?? 1);
    const cost = Number(draft.cost ?? 1);

    if (!Number.isFinite(pages) || pages < 1) return setMsg("Pages must be >= 1.");
    if (!Number.isFinite(cost) || cost < 0) return setMsg("Cost must be >= 0.");

    setMsg("");
    const { error } = await supabase.rpc("update_resource_metadata", {
      p_id: draft.id,
      p_title: title,
      p_type: draft.type,
      p_page_count: pages,
      p_cost: cost,
      p_course_id: draft.course_id,
    });

    if (error) return setMsg(error.message);

    setMsg("Updated ✏️");
    setEditingId(null);
    setDraft(null);
    load();
  }

  async function togglePreview(id: string) {
    // close if same
    if (openPreviewId === id) {
      setOpenPreviewId(null);
      return;
    }

    setMsg("");
    setOpenPreviewId(id);

    // already fetched
    if (previewUrlById[id]) return;

    setPreviewLoadingById((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/resource-preview/${id}`);
      const json = await res.json();

      if (!res.ok) {
        setMsg(json?.error || "Could not load preview");
        setOpenPreviewId(null);
        return;
      }

      if (!json?.url) {
        setMsg("Preview URL missing");
        setOpenPreviewId(null);
        return;
      }

      setPreviewUrlById((p) => ({ ...p, [id]: json.url as string }));
    } finally {
      setPreviewLoadingById((p) => ({ ...p, [id]: false }));
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Moderator</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Preview, edit metadata, approve.
          </p>
        </div>

        <button
          onClick={load}
          className="px-4 py-2 rounded-2xl text-sm border border-zinc-200 bg-white/60 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 backdrop-blur"
        >
          Refresh
        </button>
      </div>

      {msg && <p className="text-sm text-zinc-700 dark:text-zinc-200">{msg}</p>}
      {loading && <p className="text-sm text-zinc-500">Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map((r) => {
          const editing = editingId === r.id;
          const previewOpen = openPreviewId === r.id;

          const courseLine = r.courses?.code
            ? `${r.courses.code} — ${r.courses.name}`
            : r.course_id
              ? "Course selected"
              : "No course";

          const previewLoading = !!previewLoadingById[r.id];
          const previewUrl = previewUrlById[r.id];

          return (
            <Card key={r.id}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 w-full">
                  {!editing ? (
                    <>
                      <div className="font-semibold text-lg text-zinc-900 dark:text-zinc-50 truncate">
                        {r.title}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {courseLine} • {r.type}
                      </div>
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        cost {r.cost}
                        {typeof r.page_count === "number" ? ` • ${r.page_count} pages` : ""}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        Editing <span className="opacity-60">•</span>
                        <span className="font-normal">{courseLine}</span>
                      </div>

                      <div>
                        <FieldLabel>Title</FieldLabel>
                        <input
                          value={draft?.title ?? ""}
                          onChange={(e) => setDraft({ ...draft!, title: e.target.value })}
                          className="mt-1 w-full rounded-2xl px-3 py-2 text-sm border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <FieldLabel>Pages</FieldLabel>
                          <input
                            type="number"
                            min={1}
                            value={Number(draft?.page_count ?? 1)}
                            onChange={(e) => setDraft({ ...draft!, page_count: Number(e.target.value) })}
                            className="mt-1 w-full rounded-2xl px-3 py-2 text-sm border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                          />
                        </div>

                        <div>
                          <FieldLabel>Cost</FieldLabel>
                          <input
                            type="number"
                            min={0}
                            value={Number(draft?.cost ?? 0)}
                            onChange={(e) => setDraft({ ...draft!, cost: Number(e.target.value) })}
                            className="mt-1 w-full rounded-2xl px-3 py-2 text-sm border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                          />
                        </div>

                        <div>
                          <FieldLabel>Type</FieldLabel>
                          <select
                            value={draft?.type ?? "Other"}
                            onChange={(e) => setDraft({ ...draft!, type: e.target.value })}
                            className="mt-1 w-full rounded-2xl px-3 py-2 text-sm border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:[color-scheme:dark]"
                          >
                            {TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {!editing && (
                  <button
                    onClick={() => {
                      setEditingId(r.id);
                      setDraft(r);
                      setMsg("");
                    }}
                    className="shrink-0 px-4 py-2 rounded-2xl text-sm border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => togglePreview(r.id)}
                  className="px-4 py-2 rounded-2xl text-sm border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  {previewOpen ? "Hide preview" : "Preview file"}
                </button>

                {editing && (
                  <>
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 rounded-2xl text-sm bg-black text-white hover:opacity-90 dark:bg-white dark:text-black"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(null);
                        setDraft(null);
                        setMsg("");
                      }}
                      className="px-4 py-2 rounded-2xl text-sm border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </>
                )}

                <button
                  onClick={() => approve(r.id)}
                  className="px-4 py-2 rounded-2xl text-sm bg-emerald-600 text-white hover:opacity-90"
                >
                  Approve
                </button>

                <button
                  onClick={() => reject(r.id)}
                  className="px-4 py-2 rounded-2xl text-sm bg-rose-500 text-white hover:opacity-90"
                >
                  Reject
                </button>
              </div>

              {/* Preview panel */}
              {previewOpen && (
                <div className="mt-4">
                  <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
                    {previewLoading && (
                      <div className="p-4 text-sm text-zinc-500">Loading preview…</div>
                    )}

                    {!previewLoading && previewUrl && (
                      <iframe
                        src={previewUrl}
                        className="w-full h-[520px]"
                        title="File preview"
                      />
                    )}

                    {!previewLoading && !previewUrl && (
                      <div className="p-4 text-sm text-zinc-500">No preview available.</div>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Tip: if preview doesn’t render,{" "}
                      <a className="underline" href={previewUrl} target="_blank" rel="noreferrer">
                        open in new tab
                      </a>
                      .
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {!loading && rows.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No pending uploads 🎉</p>
      )}
    </main>
  );
}