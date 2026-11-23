"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Row = {
  id: string;
  title: string;
  type: string;
  cost: number;
  page_count: number | null;
  quality_multiplier: number | null;
  created_at: string;
  uploader_id: string | null;
  course_id: string | null;
  courses?: { code: string; name: string }[] | null;
};

const TYPES = ["Past Paper", "Notes", "Assignment", "Lab", "Cheat Sheet", "Summary", "Other"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="label mb-0">{children}</div>;
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        id,title,type,cost,page_count,quality_multiplier,created_at,uploader_id,course_id,
        courses ( code, name )
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) setMsg(error.message);

    const safe = (data ?? []) as unknown as Row[];
    setRows(safe);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveResourceMetadata(input: Row) {
    const title = (input.title ?? "").trim();
    if (!title) return "Title cannot be empty.";

    const pages = Number(input.page_count ?? 1);
    const cost = Number(input.cost ?? 1);

    if (!Number.isFinite(pages) || pages < 1) return "Pages must be >= 1.";
    if (!Number.isFinite(cost) || cost < 0) return "Cost must be >= 0.";

    const qualityMultiplier = Number(input.quality_multiplier ?? 1);

    if (!Number.isFinite(qualityMultiplier) || qualityMultiplier < 0 || qualityMultiplier > 5) {
      return "Quality modifier must be between 0 and 5.";
    }

    const { error } = await supabase.rpc("update_resource_metadata", {
      p_id: input.id,
      p_title: title,
      p_type: input.type,
      p_page_count: pages,
      p_cost: cost,
      p_quality_multiplier: qualityMultiplier,
      p_course_id: input.course_id,
    });

    return error?.message ?? null;
  }

  async function approve(id: string, reward?: number) {
    const { error } = await supabase.rpc("approve_resource_with_reward", {
      p_resource_id: id,
      p_reward_override: reward ?? null,
    });

    return error?.message ?? null;
  }

  async function deleteResource(id: string) {
    const ok = confirm("Delete this file and resource record? This cannot be undone.");
    if (!ok) return;

    setMsg("");
    setDeletingId(id);

    try {
      const res = await fetch(`/api/mod/resource/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(json?.error || "Failed to delete resource");
        return;
      }

      setMsg("Deleted.");
      setEditingId((current) => (current === id ? null : current));
      setDraft((current) => (current?.id === id ? null : current));
      setOpenPreviewId((current) => (current === id ? null : current));
      setPreviewUrlById((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  async function reject(id: string) {
    setMsg("");
    const reason = (prompt("Reject reason?") || "Rejected").trim();

    const { error } = await supabase.rpc("reject_resource", {
      p_resource_id: id,
      p_reason: reason || "Rejected",
    });

    if (error) return setMsg(error.message);

    setMsg("Rejected.");
    setEditingId(null);
    setDraft(null);
    setOpenPreviewId(null);
    load();
  }

  async function saveEdit() {
    if (!draft) return;

    setMsg("");
    const errorMessage = await saveResourceMetadata(draft);
    if (errorMessage) return setMsg(errorMessage);

    setMsg("Metadata saved.");
    setEditingId(null);
    setDraft(null);
    load();
  }

  async function approveWithDraft(id: string) {
    setMsg("");

    if (editingId === id && draft?.id === id) {
      const errorMessage = await saveResourceMetadata(draft);
      if (errorMessage) return setMsg(errorMessage);
    }

    const approveError = await approve(id);
    if (approveError) return setMsg(approveError);

    setMsg("Approved — uploader has been credited.");
    setEditingId((current) => (current === id ? null : current));
    setDraft((current) => (current?.id === id ? null : current));
    await load();
  }

  async function togglePreview(id: string) {
    if (openPreviewId === id) {
      setOpenPreviewId(null);
      return;
    }

    setMsg("");
    setOpenPreviewId(id);

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
    <main className="page">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="h1">Moderator</h1>
          <p className="text-sm muted">
            {rows.length} pending · preview, edit metadata, approve.
          </p>
        </div>

        <button
          onClick={load}
          className="btn-secondary"
        >
          Refresh
        </button>
      </div>

      {msg && <p className="notice">{msg}</p>}
      {loading && <p className="text-sm muted">Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map((r) => {
          const editing = editingId === r.id;
          const previewOpen = openPreviewId === r.id;

          const c0 = r.courses?.[0] ?? null;
          const courseLine = c0?.code ? `${c0.code} — ${c0.name}` : r.course_id ? "Course selected" : "No course";

          const previewLoading = !!previewLoadingById[r.id];
          const previewUrl = previewUrlById[r.id];

          return (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 w-full">
                  {!editing ? (
                    <>
                      <div className="truncate text-lg font-semibold">
                        {r.title}
                      </div>
                      <div className="mt-1 text-sm muted">
                        {courseLine} · {r.type}
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">
                        {r.cost} credits
                        {typeof r.page_count === "number" ? ` · ${r.page_count} pages` : ""}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="badge-neutral gap-2">
                        Editing <span className="opacity-60">·</span>
                        <span className="font-normal">{courseLine}</span>
                      </div>

                      <div>
                        <FieldLabel>Title</FieldLabel>
                        <input
                          value={draft?.title ?? ""}
                          onChange={(e) => setDraft({ ...draft!, title: e.target.value })}
                          className="input mt-1 px-3 py-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div>
                          <FieldLabel>Pages</FieldLabel>
                          <input
                            type="number"
                            min={1}
                            value={Number(draft?.page_count ?? 1)}
                            onChange={(e) => setDraft({ ...draft!, page_count: Number(e.target.value) })}
                            className="input mt-1 px-3 py-2"
                          />
                        </div>

                        <div>
                          <FieldLabel>Cost</FieldLabel>
                          <input
                            type="number"
                            min={0}
                            value={Number(draft?.cost ?? 0)}
                            onChange={(e) => setDraft({ ...draft!, cost: Number(e.target.value) })}
                            className="input mt-1 px-3 py-2"
                          />
                        </div>

                        <div>
                          <FieldLabel>Quality modifier</FieldLabel>
                          <input
                            type="number"
                            min={0}
                            max={5}
                            step={0.1}
                            value={Number(draft?.quality_multiplier ?? 1)}
                            onChange={(e) =>
                              setDraft({ ...draft!, quality_multiplier: Number(e.target.value) })
                            }
                            className="input mt-1 px-3 py-2"
                          />
                        </div>

                        <div>
                          <FieldLabel>Type</FieldLabel>
                          <select
                            value={draft?.type ?? "Other"}
                            onChange={(e) => setDraft({ ...draft!, type: e.target.value })}
                            className="input mt-1 px-3 py-2"
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
                    className="btn-secondary shrink-0"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => togglePreview(r.id)}
                  className="btn-secondary"
                >
                  {previewOpen ? "Hide preview" : "Preview file"}
                </button>

                {editing && (
                  <>
                    <button
                      onClick={saveEdit}
                      className="btn-primary"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(null);
                        setDraft(null);
                        setMsg("");
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </>
                )}

                <button
                  onClick={() => approveWithDraft(r.id)}
                  className="btn bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Approve
                </button>

                <button
                  onClick={() => reject(r.id)}
                  className="btn bg-rose-500 text-white hover:bg-rose-600"
                >
                  Reject
                </button>

                <button
                  onClick={() => deleteResource(r.id)}
                  disabled={deletingId === r.id}
                  className="btn-danger"
                >
                  {deletingId === r.id ? "Deleting…" : "Delete file"}
                </button>
              </div>

              {previewOpen && (
                <div className="mt-4">
                  <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    {previewLoading && <div className="p-4 text-sm text-zinc-500">Loading preview…</div>}

                    {!previewLoading && previewUrl && (
                      <iframe src={previewUrl} className="w-full h-[520px]" title="File preview" />
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
            </div>
          );
        })}
      </div>

      {!loading && rows.length === 0 && (
        <p className="card text-sm muted">No pending uploads — all caught up 🎉</p>
      )}
    </main>
  );
}