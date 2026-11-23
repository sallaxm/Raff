"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { BookOpen, Search, UploadCloud, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { APPROVAL_REWARD, downloadCost, FIRST_UPLOAD_BONUS, uploaderShare } from "@/lib/credits";
import { cn } from "@/lib/format";

export type CourseOption = { id: string; code: string; name: string; institution_id: string };
export type ProgramOption = { id: string; name: string; short_name: string | null; institution_id: string };

const CATEGORIES = ["Past Paper", "Notes", "Assignment", "Lab", "Cheat Sheet", "Summary", "Other"];

// Page counting is attempted for PDF and DOCX only.
const ACCEPT = ".pdf,.docx,.pptx,.xlsx,.txt,.md,.zip,.rar,.7z,.png,.jpg,.jpeg,.webp";

type Target = "course" | "program";

async function countPdfPages(file: File): Promise<number | null> {
  try {
    const buf = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pageCount = pdf.getPageCount();
    return pageCount > 0 ? pageCount : null;
  } catch {
    return null;
  }
}

async function countDocxPages(file: File): Promise<number | null> {
  try {
    // Mammoth doesn't reliably give "pages" (Word pages are layout-dependent),
    // so we use a heuristic: estimate pages based on word count.
    // If you later want, we can move this to server for better parsing.
    const mammoth = await import("mammoth/mammoth.browser");

    const buf = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
    const words = String(value || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (!words) return null;

    // Heuristic: ~350 words/page (rough). Clamp min 1.
    return Math.max(1, Math.round(words / 350));
  } catch {
    return null;
  }
}

async function detectPages(file: File): Promise<number | null> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) return await countPdfPages(file);
  if (name.endsWith(".docx")) return await countDocxPages(file);

  // Could add pptx/xlsx heuristics later if you want.
  return null;
}/** Type-ahead course picker (code or name). */
function CoursePicker({
  value,
  onChange,
}: {
  value: CourseOption | null;
  onChange: (c: CourseOption | null) => void;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [q, setQ] = useState("");
  const [found, setResults] = useState<CourseOption[]>([]);
  const results = q.trim().length >= 2 ? found : [];

  useEffect(() => {
    const needle = q.trim();
    if (needle.length < 2) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const code = needle.replace(/\s+/g, "").toUpperCase().replace(/[\\%_,()]/g, "");
      const name = needle.replace(/[\\%_,()]/g, "");
      const { data } = await supabase
        .from("courses")
        .select("id, code, name, institution_id")
        .or(`code.ilike.${code}%,name.ilike.%${name}%`)
        .order("code")
        .limit(12);
      if (!cancelled) setResults((data ?? []) as CourseOption[]);
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, supabase]);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/30">
        <BookOpen size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{value.code}</div>
          <div className="truncate text-sm muted">{value.name}</div>
        </div>
        <button type="button" onClick={() => onChange(null)} className="btn-ghost px-2" aria-label="Change course">
          <X size={16} /> Change
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="input flex items-center gap-2">
        <Search size={16} className="shrink-0 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type a course code or name, e.g. MATH1030"
          aria-label="Find your course"
          className="w-full bg-transparent outline-none"
          autoComplete="off"
        />
      </label>
      {results.length > 0 && (
        <ul className="max-h-72 overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onChange(c)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span className="w-[84px] shrink-0 font-semibold tabular-nums">{c.code}</span>
                <span className="truncate">{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {q.trim().length >= 2 && results.length === 0 && (
        <p className="px-1 text-xs muted">No courses found. Check the code on your timetable.</p>
      )}
    </div>
  );
}

export default function UploadForm({
  initialCourse,
  programs,
  defaultProgramId,
}: {
  initialCourse: CourseOption | null;
  programs: ProgramOption[];
  defaultProgramId: string | null;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [target, setTarget] = useState<Target>("course");
  const [course, setCourse] = useState<CourseOption | null>(initialCourse);
  const [programId, setProgramId] = useState(defaultProgramId ?? programs[0]?.id ?? "");
  const [type, setType] = useState("Past Paper");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [detectedPages, setDetectedPages] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [done, setDone] = useState<{ courseId: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetectedPages(null);
    if (file) void detectPages(file).then((p) => !cancelled && setDetectedPages(p));
    return () => {
      cancelled = true;
    };
  }, [file]);

  async function upload() {
    setMsg(null);
    const fail = (text: string) => setMsg({ ok: false, text });

    if (!file) return fail("Choose a file to upload.");
    if (target === "course" && !course) return fail("Pick the course this file is for.");
    const program = programs.find((p) => p.id === programId);
    if (target === "program" && !program) return fail("Pick a program.");

    setBusy(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return fail("Please log in first.");

      const path = `${auth.user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("resources").upload(path, file, { upsert: false });
      if (uploadError) return fail(uploadError.message);

      const pageCount = detectedPages ?? 1;
      const cost = downloadCost(); // the database recomputes this too

      const { error: insertError } = await supabase.from("resources").insert({
        institution_id: target === "course" ? course!.institution_id : program!.institution_id,
        uploader_id: auth.user.id,
        title: title.trim() || file.name,
        type,
        cost,
        page_count: pageCount,
        storage_path: path,
        status: "pending",
        course_id: target === "course" ? course!.id : null,
        major_id: target === "program" ? program!.id : null,
      });

      if (insertError) {
        await supabase.storage.from("resources").remove([path]);
        return fail(insertError.message);
      }

      setDone({ courseId: target === "course" ? course!.id : null });
      setTitle("");
      setFile(null);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="card space-y-3 text-center">
        <p className="text-lg font-semibold">Uploaded — thank you!</p>
        <p className="text-sm muted">
          A moderator will review it soon. Once it&apos;s approved you get +{APPROVAL_REWARD} credits (+
          {FIRST_UPLOAD_BONUS} more if it&apos;s your first), then +{uploaderShare()} every time someone downloads it.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => setDone(null)} className="btn-primary">
            Upload another
          </button>
          {done.courseId && (
            <Link href={`/course/${done.courseId}`} className="btn-secondary">
              Back to the course
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="card min-w-0 space-y-5">
      <div>
        <span className="label">This file is for</span>
        <div className="segmented">
          <button type="button" onClick={() => setTarget("course")} className={cn("segment", target === "course" && "segment-active")}>
            One course
          </button>
          <button type="button" onClick={() => setTarget("program")} className={cn("segment", target === "program" && "segment-active")}>
            A whole program
          </button>
        </div>
      </div>

      {target === "course" ? (
        <div>
          <span className="label">Course</span>
          <CoursePicker value={course} onChange={setCourse} />
        </div>
      ) : (
        <div>
          <label className="label" htmlFor="program">Program</label>
          <select id="program" value={programId} onChange={(e) => setProgramId(e.target.value)}>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <span className="label">Type</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" onClick={() => setType(cat)} className={cn("pill", type === cat && "pill-active")}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="label">File</span>
        <label
          htmlFor="file"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 px-4 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/40 dark:border-zinc-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
        >
          <UploadCloud size={24} className="text-zinc-400" />
          {file ? (
            <span className="max-w-full truncate text-sm font-medium">{file.name}</span>
          ) : (
            <span className="text-sm muted">Tap to choose a file · PDF, DOCX, slides, images… (max 50 MB)</span>
          )}
        </label>
        <input id="file" type="file" accept={ACCEPT} onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="sr-only" />
      </div>

      <div>
        <label className="label" htmlFor="title">Title</label>
        <input
          id="title"
          placeholder={file ? file.name : "e.g. Midterm 2024 with solutions"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-blue-100 to-pink-100 px-4 py-3 text-sm dark:from-zinc-800 dark:to-zinc-700">
        <span className="font-medium">
          +{APPROVAL_REWARD} credits when approved, then +{uploaderShare()} every time someone downloads it.
        </span>
        <span className="opacity-70"> Your first approved upload also earns a +{FIRST_UPLOAD_BONUS} bonus.</span>
      </div>

      {msg && <p className={msg.ok ? "notice-success" : "notice-error"}>{msg.text}</p>}

      <button type="button" onClick={upload} disabled={busy} className="btn-primary btn-lg w-full">
        {busy ? "Uploading…" : "Upload"}
      </button>
    </section>
  );
}
