"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { UploadCloud } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { downloadCost, FIRST_UPLOAD_BONUS, plural, uploadReward } from "@/lib/credits";
import { cn } from "@/lib/format";

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


type MajorCourseJoinRow = {
  courses: Course | null;
};

type UploadMode = "course" | "major";

type LastUploadEstimate = {
  credits: number;
  pageCount: number;
};

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
  const estimate = file
    ? { pages: detectedPages ?? 1, reward: uploadReward(downloadCost(detectedPages ?? 1)) }
    : null;
  const [lastUploadEstimate, setLastUploadEstimate] = useState<LastUploadEstimate | null>(null);

  const selectedCollege = useMemo(
    () => colleges.find((college) => college.id === collegeId) ?? null,
    [collegeId, colleges]
  );

  // Load colleges
  useEffect(() => {
    async function load() {
      await fetch("/api/bootstrap/islamic-studies", { method: "POST" }).catch(() => null);

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
      const resolvedTitle = cleanTitle || file.name;

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
      const cost = downloadCost(pageCount); // DB trigger recomputes this too

      const payload: ResourceInsert = {
        institution_id: selectedCollege.institution_id,
        uploader_id: u.user.id,
        title: resolvedTitle,
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

      setLastUploadEstimate({ credits: uploadReward(cost), pageCount });
      setMsg("Uploaded! A moderator will review it soon — you’ll get credits once it’s approved.");
      setTitle("");
      setFile(null);
      setDetectedPages(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-narrow">
      <section className="card-hero">
        <h1 className="h1">Upload a resource</h1>
        <p className="mt-1 text-sm muted">
          Share notes or past papers and earn credits once a moderator approves them.{" "}
          <Link href="/guidelines" className="underline underline-offset-4">
            Read the guidelines
          </Link>
          .
        </p>
      </section>

      <section className="card min-w-0 space-y-5">
        {msg && <p className="notice">{msg}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="college">College</label>
            <select id="college" value={collegeId} onChange={(e) => setCollegeId(e.target.value)}>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="major">Major</label>
            <select id="major" value={majorId} onChange={(e) => setMajorId(e.target.value)}>
              {majors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="label">Applies to</span>
          <div className="segmented">
            {(["course", "major"] as UploadMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn("segment", mode === m && "segment-active")}
              >
                {m === "course" ? "A specific course" : "The whole major"}
              </button>
            ))}
          </div>
        </div>

        {mode === "course" && (
          <div>
            <label className="label" htmlFor="course">Course</label>
            <select id="course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <span className="label">Type</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setType(cat)}
                className={cn("pill", type === cat && "pill-active")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="title">Title</label>
          <input
            id="title"
            placeholder={file ? file.name : "e.g. MATH101 Midterm 2024"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />
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
              <span className="text-sm muted">Tap to choose a file · PDF, DOCX, slides, images…</span>
            )}
          </label>
          <input
            id="file"
            type="file"
            accept={ACCEPT}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-blue-100 to-pink-100 px-4 py-3 text-sm dark:from-zinc-800 dark:to-zinc-700">
          {estimate ? (
            <>
              <span className="font-medium">Estimated reward: {plural(estimate.reward, "credit")}</span>
              <span className="opacity-70">
                {" "}· {plural(estimate.pages, "page")} {detectedPages == null ? "(not detected)" : "detected"} · plus{" "}
                {FIRST_UPLOAD_BONUS} bonus on your first approved upload
              </span>
            </>
          ) : lastUploadEstimate ? (
            <span className="font-medium">
              Last upload: ~{plural(lastUploadEstimate.credits, "credit")} once approved
            </span>
          ) : (
            <span className="opacity-70">Choose a file to see your estimated reward.</span>
          )}
        </div>

        <button type="button" onClick={upload} disabled={loading} className="btn-primary btn-lg w-full">
          {loading ? "Uploading…" : "Upload"}
        </button>
      </section>
    </main>
  );
}
