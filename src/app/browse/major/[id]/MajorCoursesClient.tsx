"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

function ChevronRight() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08-.01Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.25 8.29a.75.75 0 0 1-.02-1.08Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-5">
      {/* Header + search */}
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-semibold">{majorName}</h1>
          <p className="text-zinc-500">Search courses, then tap to open resources</p>
        </div>

        <div
          className="
            flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2
            shadow-sm
            dark:bg-zinc-900 dark:border-zinc-800
          "
        >
          <span className="text-zinc-400">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${totalCourses} courses…`}
            className="w-full bg-transparent outline-none text-sm"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-xs px-2 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 transition dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {Object.entries(years)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([year, courseRows]) => (
            <details
              key={year}
              className="
                group rounded-3xl border border-zinc-200 bg-white shadow-sm
                dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden
              "
              open
            >
              <summary className="cursor-pointer list-none p-5 text-lg font-semibold flex items-center justify-between">
                <span>Year {year}</span>
                <span className="text-zinc-400 group-open:hidden">
                  <ChevronDown />
                </span>
                <span className="text-zinc-400 hidden group-open:block rotate-180">
                  <ChevronDown />
                </span>
              </summary>

              <div className="px-5 pb-5 space-y-2">
                {courseRows.map((r) => (
                  <Link
                    key={r.courses.id}
                    href={`/course/${r.courses.id}`}
                    className="
                      flex items-center justify-between gap-3 rounded-2xl
                      border border-zinc-200 p-3
                      hover:shadow-sm hover:bg-zinc-50 transition
                      dark:border-zinc-700 dark:hover:bg-zinc-800/40
                    "
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.courses.code}</div>
                      <div className="text-sm text-zinc-500 truncate">{r.courses.name}</div>
                      <div className="text-xs text-zinc-400">Semester {r.semester}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {r.is_elective && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                          Elective
                        </span>
                      )}

                      {/* nicer “arrow” */}
                      <span
                        className="
                          inline-flex items-center justify-center h-9 w-9 rounded-full
                          bg-zinc-100 text-zinc-600
                          dark:bg-zinc-800 dark:text-zinc-300
                        "
                        aria-hidden="true"
                      >
                        <ChevronRight />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </details>
          ))}

        {Object.keys(years).length === 0 && (
          <p className="text-zinc-500">No matches. Try a different search.</p>
        )}
      </div>
    </main>
  );
}