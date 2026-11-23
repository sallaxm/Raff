"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Search, X } from "lucide-react";

type CourseRow = {
  year: number;
  semester: number;
  is_elective: boolean;
  courses: {
    id: string;
    code: string;
    name: string;
  };
};

export default function MajorCoursesClient({
  majorName,
  rows,
}: {
  majorName: string;
  rows: CourseRow[];
}) {
  const [q, setQ] = useState("");

  const years = useMemo(() => {
    const trimmed = q.trim().toLowerCase();

    const filtered = !trimmed
      ? rows
      : rows.filter((r) => {
          const code = r.courses?.code?.toLowerCase() ?? "";
          const name = r.courses?.name?.toLowerCase() ?? "";
          return code.includes(trimmed) || name.includes(trimmed);
        });

    const byYear: Record<number, CourseRow[]> = {};
    for (const r of filtered) {
      if (!r.courses?.id) continue;
      if (!byYear[r.year]) byYear[r.year] = [];
      byYear[r.year].push(r);
    }

    // sort inside each year by semester then code
    for (const y of Object.keys(byYear)) {
      byYear[Number(y)].sort((a, b) => {
        if (a.semester !== b.semester) return a.semester - b.semester;
        return (a.courses.code || "").localeCompare(b.courses.code || "");
      });
    }

    return byYear;
  }, [q, rows]);

  const totalCourses = rows.length;

  const sortedYears = Object.entries(years).sort((a, b) => Number(a[0]) - Number(b[0]));

  return (
    <main className="page-narrow">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="h1">{majorName}</h1>
            <p className="muted">Search courses, then tap one to see its resources</p>
          </div>
          <Link href="/browse" className="btn-secondary">
            <ArrowLeft size={14} /> Browse
          </Link>
        </div>

        <label className="input flex items-center gap-2">
          <Search size={16} className="shrink-0 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${totalCourses} courses…`}
            aria-label="Search courses"
            className="w-full bg-transparent outline-none"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="text-zinc-400 hover:text-zinc-600">
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      <div className="space-y-4">
        {sortedYears.map(([year, courseRows]) => (
          <details key={year} open className="card group overflow-hidden p-0">
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-lg font-semibold">
              <span>Year {year}</span>
              <ChevronDown size={18} className="text-zinc-400 transition group-open:rotate-180" />
            </summary>

            <div className="space-y-2 px-5 pb-5">
              {courseRows.map((r) => (
                <Link
                  key={r.courses.id}
                  href={`/course/${r.courses.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 p-3 transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/40"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{r.courses.code}</div>
                    <div className="truncate text-sm muted">{r.courses.name}</div>
                    <div className="text-xs text-zinc-400">Semester {r.semester}</div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {r.is_elective && (
                      <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200">
                        Elective
                      </span>
                    )}
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </details>
        ))}

        {sortedYears.length === 0 && <p className="card text-sm muted">No matches. Try a different search.</p>}
      </div>
    </main>
  );
}
