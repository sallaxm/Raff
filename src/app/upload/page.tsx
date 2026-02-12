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
  const [pages, setPages] = useState(5);
  const [file, setFile] = useState<File | null>(null);

  const estimatedCredits = Math.max(1, Math.round(pages / 2));

  // Load colleges
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("colleges")
        .select("id,name")
        .eq("institution_id", "udst")
        .order("name");

      if (data) {
        setColleges(data);
        if (data.length) setCollegeId(data[0].id);
      }
    }

    load();
  }, [supabase]);

  // Load majors
  useEffect(() => {
    if (!collegeId) return;

    async function loadMajors() {
      const { data } = await supabase
        .from("majors")
        .select("id,name")
        .eq("college_id", collegeId)
        .order("name");

      if (data) {
        setMajors(data);
        setMajorId(data[0]?.id ?? "");
      }
    }

    loadMajors();
  }, [collegeId, supabase]);

  // Load courses
  useEffect(() => {
    if (!majorId) return;

    async function loadCourses() {
      const { data } = await supabase
        .from("major_courses")
        .select("courses(id,code,name)")
        .eq("major_id", majorId);

      if (!data) return;

      const list = data.map((x: any) => x.courses).filter(Boolean);

      setCourses(list);
      setCourseId(list[0]?.id ?? "");
    }

    loadCourses();
  }, [majorId, supabase]);

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

    const { error: uploadError } = await supabase.storage
      .from("resources")
      .upload(path, file);

    if (uploadError) {
      setMsg(uploadError.message);
      setLoading(false);
      return;
    }

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

    if (mode === "course") payload.course_id = courseId;
    else payload.major_id = majorId;

    const { error: insertError } = await supabase
      .from("resources")
      .insert(payload);

    if (insertError) {
      await supabase.storage.from("resources").remove([path]);
      setMsg(insertError.message);
      setLoading(false);
      return;
    }

    setMsg("Uploaded ✅ Pending approval.");
    setTitle("");
    setFile(null);
    setPages(5);
    setLoading(false);
  }

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6">

      {/* HEADER */}
      <div className="
        rounded-3xl p-6
        bg-gradient-to-br from-blue-50 via-white to-pink-50
        dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800
        border border-zinc-200 dark:border-zinc-800
      ">
        <h1 className="text-3xl font-semibold tracking-tight">
          Upload Resource
        </h1>

        <p className="text-sm text-zinc-500 mt-1">
          Earn credits when your upload is approved.
        </p>
      </div>


      {/* FORM */}
      <div className="
        rounded-3xl p-6 space-y-5
        bg-white/70 dark:bg-zinc-900/70
        backdrop-blur-xl
        border border-zinc-200 dark:border-zinc-800
      ">

        {msg && (
          <div className="text-sm px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            {msg}
          </div>
        )}

        {/* College */}
        <select
          value={collegeId}
          onChange={(e) => setCollegeId(e.target.value)}
          className="input"
        >
          {colleges.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Major */}
        <select
          value={majorId}
          onChange={(e) => setMajorId(e.target.value)}
          className="input"
        >
          {majors.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {/* Mode pills */}
        <div className="flex gap-2">
          {["course","major"].map(m => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              className={`
                px-4 py-2 rounded-full text-sm
                border transition
                ${mode === m
                  ? "bg-black text-white border-black dark:bg-white dark:text-black"
                  : "border-zinc-300 dark:border-zinc-700"}
              `}
            >
              {m === "course" ? "Course Upload" : "General Major"}
            </button>
          ))}
        </div>

        {/* Course */}
        {mode === "course" && (
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="input"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        )}

        {/* CATEGORY PILLS */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setType(cat)}
              className={`
                px-4 py-2 rounded-full text-sm
                border transition
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
          className="input"
        />

        <input
          type="number"
          value={pages}
          onChange={(e) => setPages(Number(e.target.value))}
          className="input"
        />

        <div className="
          rounded-2xl px-4 py-3
          bg-gradient-to-r from-blue-100 to-pink-100
          dark:from-zinc-800 dark:to-zinc-700
          text-sm font-medium
        ">
          Estimated reward: {estimatedCredits} credits
        </div>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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