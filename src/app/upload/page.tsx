"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type College = { id: string; name: string; institution_id: string };
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

// Allow lots of types. Page counting only attempted for PDF + DOCX.
const ACCEPT =
  ".pdf,.docx,.pptx,.xlsx,.txt,.md,.zip,.rar,.7z,.png,.jpg,.jpeg,.webp";

type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (source: { data: ArrayBuffer }) => { promise: Promise<{ numPages?: number }> };
};

type MammothModule = {
  extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value?: string }>;
};

type MajorCourseJoinRow = {
  courses: Course | null;
};

type UploadMode = "course" | "major";

type ResourceInsert = {
  institution_id: string;
  uploader_id: string;
  title: string;
  type: string;
  cost: number;
  page_count: number;
  storage_path: string;
  status: "pending";
  course_id: string | null;
  major_id: string | null;
};

async function countPdfPages(file: File): Promise<number | null> {
  try {
    // pdfjs-dist works client-side
    const pdfjs = (await import("pdfjs-dist/legacy/build/pdf")) as unknown as PdfJsModule;
    // Worker setup (CDN). If this fails in some environments, we just fallback to null.
    try {
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";
    } catch {}

    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    return typeof doc.numPages === "number" ? doc.numPages : null;
  } catch {
    return null;
  }
}

async function countDocxPages(file: File): Promise<number | null> {
  try {
    // Mammoth doesn't reliably give "pages" (Word pages are layout-dependent),
    // so we use a heuristic: estimate pages based on word count.
    // If you later want, we can move this to server for better parsing.
    const mammoth = (await import("mammoth/mammoth.browser")) as unknown as MammothModule;

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

  const [mode, setMode] = useState<UploadMode>("course");

  const [title, setTitle] = useState("");
  const [type, setType] = useState("Past Paper");
  const [file, setFile] = useState<File | null>(null);

  const [detectedPages, setDetectedPages] = useState<number | null>(null);
  const estimatedCredits =
    detectedPages == null ? null : Math.max(1, Math.round(detectedPages / 2));

  const selectedCollege = useMemo(
    () => colleges.find((college) => college.id === collegeId) ?? null,
    [collegeId, colleges]
  );

  // Load colleges
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("colleges")
        .select("id,name,institution_id")
        .order("institution_id")
        .order("name");

      if (error) {
        setMsg(error.message);
        return;
      }

      const list = (data ?? []) as College[];
      setColleges(list);
      if (list.length) setCollegeId(list[0].id);
    }

    load();
  }, [supabase]);

  // Load majors when college changes
  useEffect(() => {
    if (!collegeId) return;

    async function loadMajors() {
      const { data, error } = await supabase
        .from("majors")
        .select("id,name")
        .eq("college_id", collegeId)
        .order("name");

      if (error) {
        setMsg(error.message);
        return;
      }

      const list = (data ?? []) as Major[];
      setMajors(list);
      setMajorId(list[0]?.id ?? "");
      // reset course list when switching college
      setCourses([]);
      setCourseId("");
    }

    loadMajors();
  }, [collegeId, supabase]);

  // Load courses when major changes (only relevant if mode === "course")
  useEffect(() => {
    if (!majorId) return;

    async function loadCourses() {
      const { data, error } = await supabase
        .from("major_courses")
        .select("courses(id,code,name)")
        .eq("major_id", majorId);

      if (error) {
        setMsg(error.message);
        return;
      }

      const list = ((data ?? []) as MajorCourseJoinRow[])
        .map((x) => x.courses)
        .filter((course): course is Course => Boolean(course));

      // Sort nicely
      list.sort((a, b) => (a.code || "").localeCompare(b.code || ""));

      setCourses(list);
      setCourseId(list[0]?.id ?? "");
    }

    loadCourses();
  }, [majorId, supabase]);

  // When mode changes to "major", clear course selection (so no useless empty list)
  useEffect(() => {
    if (mode === "major") {
      setCourseId("");
    } else {
      // if switching back to course mode, pick first course if available
      setCourseId((prev) => prev || courses[0]?.id || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // When file changes, try detect pages
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setDetectedPages(null);
      if (!file) return;

      const pages = await detectPages(file);
      if (!cancelled) setDetectedPages(pages);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [file]);

  async function upload() {
    setMsg("");
    setLoading(true);

    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setMsg("Login first.");
        return;
      }

      if (!file) {
        setMsg("Choose a file.");
        return;
      }

      const cleanTitle = title.trim();
      if (!cleanTitle) {
        setMsg("Title is required.");
        return;
      }

      if (!collegeId || !majorId) {
        setMsg("Pick a college and major.");
        return;
      }

      if (!selectedCollege) {
        setMsg("Invalid college selection.");
        return;
      }

      if (mode === "course" && !courseId) {
        setMsg("Pick a course (or switch to General Major).");
        return;
      }

      const path = `${u.user.id}/${crypto.randomUUID()}-${file.name}`;

      // Upload file first
      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setMsg(uploadError.message);
        return;
      }

      // Page count: use detected pages (pdf/docx) else null (mod can set later)
      const pageCount = detectedPages ?? 1; // ✅ never null (DB requires NOT NULL)
      const cost = Math.max(1, Math.ceil(pageCount / 5));

      const payload: ResourceInsert = {
        institution_id: selectedCollege.institution_id,
        uploader_id: u.user.id,
        title: cleanTitle,
        type,
        cost,
        page_count: pageCount,
        storage_path: path,
        status: "pending",
        course_id: null,
        major_id: null,
      };

      if (mode === "course") payload.course_id = courseId;
      else payload.major_id = majorId;

      const { error: insertError } = await supabase.from("resources").insert(payload);

      if (insertError) {
        // if DB fails, delete uploaded file
        await supabase.storage.from("resources").remove([path]);
        setMsg(insertError.message);
        return;
      }

      setMsg("Uploaded ✅ Pending approval.");
      setTitle("");
      setFile(null);
      setDetectedPages(null);
    } finally {
      setLoading(false);
    }
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
        <p className="text-sm text-zinc-500 mt-1">
          Earn credits when your upload is approved.
        </p>
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
          {(["course", "major"] as UploadMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`
                px-4 py-2 rounded-full text-sm
                border transition whitespace-nowrap
                ${
                  mode === m
                    ? "bg-black text-white border-black dark:bg-white dark:text-black"
                    : "border-zinc-300 dark:border-zinc-700"
                }
              `}
            >
              {m === "course" ? "Course Upload" : "General Major"}
            </button>
          ))}
        </div>

        {/* Course (ONLY show if course mode) */}
        {mode === "course" && (
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
                border transition whitespace-nowrap
                ${
                  type === cat
                    ? "bg-black text-white border-black dark:bg-white dark:text-black"
                    : "border-zinc-300 dark:border-zinc-700"
                }
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

        {/* Estimated reward (pages auto-detected when possible) */}
        <div
          className="
            rounded-2xl px-4 py-3
            bg-gradient-to-r from-blue-100 to-pink-100
            dark:from-zinc-800 dark:to-zinc-700
            text-sm font-medium
            break-words
          "
        >
          {detectedPages == null ? (
            <span>Estimated reward: <span className="opacity-70">TBD (auto-detect for PDF/DOCX)</span></span>
          ) : (
            <span>
              Estimated reward: {estimatedCredits} credits{" "}
              <span className="opacity-70">• {detectedPages} pages detected</span>
            </span>
          )}
        </div>

        <input
          type="file"
          accept={ACCEPT}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full min-w-0"
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