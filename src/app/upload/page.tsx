"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type College = { id: string; name: string };
type Major = { id: string; name: string };
type Course = { id: string; code: string; name: string };

const categories = [
  "Past Paper",
  "Notes",
  "Assignment",
  "Lab",
  "Cheat Sheet",
  "Summary",
  "Other",
];

function estimatePagesFromText(text: string) {
  // Rough, but stable: ~350 words/page
  const words = (text.trim().match(/\S+/g) ?? []).length;
  return Math.max(1, Math.ceil(words / 350));
}

async function countPdfPages(file: File): Promise<number | null> {
  try {
    // Requires: npm i pdf-lib
    const { PDFDocument } = await import("pdf-lib");
    const buf = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buf);
    return pdf.getPageCount();
  } catch {
    return null;
  }
}

async function estimateDocxPages(file: File): Promise<number | null> {
  try {
    // Requires: npm i mammoth
    const mammoth = await import("mammoth/mammoth.browser");
    const buf = await file.arrayBuffer();
    const res = await mammoth.extractRawText({ arrayBuffer: buf as any });
    const text = res?.value ?? "";
    if (!text.trim()) return null;
    return estimatePagesFromText(text);
  } catch {
    return null;
  }
}

export default function UploadPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [colleges, setColleges] = useState<College[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [collegeId, setCollegeId] = useState("");
  const [majorId, setMajorId] = useState("");
  const [courseId, setCourseId] = useState("");

  const [mode, setMode] = useState<"course" | "major">("course");

  const [title, setTitle] = useState("");
  const [type, setType] = useState("Past Paper");
  const [file, setFile] = useState<File | null>(null);

  // auto page count
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageNote, setPageNote] = useState<string>("");

  // reward is based on pages if known, otherwise minimum
  const estimatedCredits = pageCount ? Math.max(1, Math.round(pageCount / 2)) : 1;

  // Load colleges
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("colleges")
        .select("id,name")
        .eq("institution_id", "udst")
        .order("name");

      if (error) return;

      const list = (data ?? []) as College[];
      setColleges(list);
      if (list.length) setCollegeId(list[0].id);
    }

    load();
  }, [supabase]);

  // Load majors
  useEffect(() => {
    if (!collegeId) return;

    async function loadMajors() {
      const { data, error } = await supabase
        .from("majors")
        .select("id,name")
        .eq("college_id", collegeId)
        .order("name");

      if (error) return;

      const list = (data ?? []) as Major[];
      setMajors(list);
      const nextMajorId = list[0]?.id ?? "";
      setMajorId(nextMajorId);

      // reset dependent course state
      setCourses([]);
      setCourseId("");
    }

    loadMajors();
  }, [collegeId, supabase]);

  // Load courses
  useEffect(() => {
    if (!majorId) return;

    async function loadCourses() {
      const { data, error } = await supabase
        .from("major_courses")
        .select("courses(id,code,name)")
        .eq("major_id", majorId);

      if (error) return;

      const list = (data ?? [])
        .map((x: any) => x?.courses)
        .filter(Boolean) as Course[];

      setCourses(list);

      // only set if there is one
      if (list.length > 0) setCourseId(list[0].id);
      else setCourseId("");
    }

    loadCourses();
  }, [majorId, supabase]);

  // When switching to major mode, make sure course selection cannot “ghost render”
  useEffect(() => {
    if (mode === "major") {
      setCourses([]);
      setCourseId("");
    }
  }, [mode]);

  // Auto count pages when file changes
  useEffect(() => {
    (async () => {
      setPageCount(null);
      setPageNote("");
      if (!file) return;

      const name = file.name.toLowerCase();
      const ext = name.split(".").pop() ?? "";

      // 500MB guard (client-side)
      const maxBytes = 500 * 1024 * 1024;
      if (file.size > maxBytes) {
        setMsg("File too large. Max size is 500MB.");
        setFile(null);
        return;
      }

      if (ext === "pdf") {
        const n = await countPdfPages(file);
        if (typeof n === "number") {
          setPageCount(n);
          setPageNote("");
        } else {
          setPageCount(null);
          setPageNote("Install pdf-lib to enable PDF page counting.");
        }
        return;
      }

      if (ext === "docx") {
        const n = await estimateDocxPages(file);
        if (typeof n === "number") {
          setPageCount(n);
          setPageNote("Estimated from text (docx).");
        } else {
          setPageCount(null);
          setPageNote("Install mammoth to enable DOCX page estimating.");
        }
        return;
      }

      // .doc (legacy) is not reliably parseable in-browser
      if (ext === "doc") {
        setPageCount(null);
        setPageNote("DOC page count not supported (use PDF/DOCX).");
        return;
      }

      // zip or other types
      setPageCount(null);
      setPageNote("");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  async function upload() {
    setMsg("");
    setLoading(true);

    const { data: u } = await supabase.auth.getUser();

    if (!u.user) {
      setMsg("Login first.");
      setLoading(false);
      return;
    }

    if (!file) {
      setMsg("Choose a file.");
      setLoading(false);
      return;
    }

    const path = `${u.user.id}/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("resources").upload(path, file);

    if (uploadError) {
      setMsg(uploadError.message);
      setLoading(false);
      return;
    }

    // If we couldn't count pages, fall back to 1
    const pages = pageCount ?? 1;

    const payload: any = {
      institution_id: "udst",
      uploader_id: u.user.id,
      title: title.trim(),
      type,
      cost: Math.max(1, Math.ceil(pages / 5)),
      page_count: pages,
      storage_path: path,
      status: "pending",
      course_id: null,
      major_id: null,
    };

    // IMPORTANT: never send empty strings to uuid columns
    if (mode === "course" && courseId) payload.course_id = courseId;
    else if (majorId) payload.major_id = majorId;

    const { error: insertError } = await supabase.from("resources").insert(payload);

    if (insertError) {
      await supabase.storage.from("resources").remove([path]);
      setMsg(insertError.message);
      setLoading(false);
      return;
    }

    setMsg("Uploaded ✅ Pending approval.");
    setTitle("");
    setType("Past Paper");
    setFile(null);
    setPageCount(null);
    setPageNote("");
    setLoading(false);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-6 overflow-x-hidden">
      {/* HEADER */}
      <div
        className="
        rounded-3xl p-6
        bg-gradient-to-br from-blue-50 via-white to-pink-50
        dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800
        border border-zinc-200 dark:border-zinc-800
      "
      >
        <h1 className="text-3xl font-semibold tracking-tight">Upload Resource</h1>
        <p className="text-sm text-zinc-500 mt-1">Earn credits when your upload is approved.</p>
      </div>

      {/* FORM */}
      <div
        className="
        rounded-3xl p-6 space-y-5
        bg-white/70 dark:bg-zinc-900/70
        backdrop-blur-xl
        border border-zinc-200 dark:border-zinc-800
        min-w-0
      "
      >
        {msg && (
          <div className="text-sm px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 break-words">
            {msg}
          </div>
        )}

        {/* College */}
        <select
          value={collegeId}
          onChange={(e) => setCollegeId(e.target.value)}
          className="input w-full min-w-0"
        >
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Major */}
        <select
          value={majorId}
          onChange={(e) => setMajorId(e.target.value)}
          className="input w-full min-w-0"
        >
          {majors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Mode pills */}
        <div className="flex flex-wrap gap-2">
          {["course", "major"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m as any)}
              className={`
                px-4 py-2 rounded-full text-sm
                border transition
                whitespace-nowrap
                ${mode === m
                  ? "bg-black text-white border-black dark:bg-white dark:text-black"
                  : "border-zinc-300 dark:border-zinc-700"}
              `}
            >
              {m === "course" ? "Upload to Specific Course" : "Upload to Major"}
            </button>
          ))}
        </div>

        {/* Course (only when needed AND has data) */}
        {mode === "course" && courses.length > 0 && (
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="input w-full min-w-0"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        )}

        {/* CATEGORY PILLS */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setType(cat)}
              className={`
                px-4 py-2 rounded-full text-sm
                border transition
                whitespace-nowrap
                ${type === cat
                  ? "bg-black text-white border-black dark:bg-white dark:text-black"
                  : "border-zinc-300 dark:border-zinc-700"}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input w-full min-w-0"
        />

        <div
          className="
            rounded-2xl px-4 py-3
            bg-gradient-to-r from-blue-100 to-pink-100
            dark:from-zinc-800 dark:to-zinc-700
            text-sm font-medium
            break-words
          "
        >
          Pages:{" "}
          <span className="font-semibold">
            {pageCount ?? "—"}
          </span>
          {pageNote ? <span className="ml-2 text-xs font-normal opacity-80">({pageNote})</span> : null}
          <div className="mt-1 text-xs font-normal opacity-80">
            Estimated reward: {estimatedCredits} credits
          </div>
        </div>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full min-w-0"
          accept=".pdf,.doc,.docx,.zip"
        />

        <button
          onClick={upload}
          disabled={loading}
          className="
            w-full py-3 rounded-2xl
            bg-black text-white
            hover:opacity-90
            disabled:opacity-50
            dark:bg-white dark:text-black
          "
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </main>
  );
}