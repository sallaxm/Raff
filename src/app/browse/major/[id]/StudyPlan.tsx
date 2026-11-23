"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, FileText, Search, X } from "lucide-react";
import PinButton from "@/components/course/PinButton";
import { cn } from "@/lib/format";
import { plural } from "@/lib/credits";

export type PlanRow = {
  year: number;
  term: number;
  elective: boolean;
  group: string | null;
  count: number;
  course: { id: string; code: string; name: string; credits: number | null };
};

const TERM_LABEL = ["", "Term 1", "Term 2", "Term 3"];

function CourseRow({ row, pinned, signedIn }: { row: PlanRow; pinned: boolean; signedIn: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/course/${row.course.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
      >
        <span className="w-[84px] shrink-0 text-sm font-semibold tabular-nums">{row.course.code}</span>
        <span className="min-w-0 flex-1 truncate text-sm">{row.course.name}</span>
        {row.count > 0 ? (
          <span className="badge-success shrink-0 gap-1">
            <FileText size={12} /> {row.count}
          </span>
        ) : (
          <span className="hidden shrink-0 text-xs text-zinc-400 sm:inline">no files</span>
        )}
      </Link>
      {signedIn && <PinButton courseId={row.course.id} pinned={pinned} compact />}
    </div>
  );
}

export default function StudyPlan({
  rows,
  pinnedIds,
  signedIn,
}: {
  rows: PlanRow[];
  pinnedIds: string[];
  signedIn: boolean;
}) {
  const [q, setQ] = useState("");
  const pinned = useMemo(() => new Set(pinnedIds), [pinnedIds]);

  const years = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/\s+/g, "");
    const filtered = needle
      ? rows.filter(
          (r) =>
            r.course.code.toLowerCase().includes(needle) ||
            r.course.name.toLowerCase().replace(/\s+/g, "").includes(needle)
        )
      : rows;

    const byYear = new Map<number, Map<number, { required: PlanRow[]; pools: Map<string, PlanRow[]> }>>();
    for (const r of filtered) {
      const terms = byYear.get(r.year) ?? new Map();
      byYear.set(r.year, terms);
      const term = terms.get(r.term) ?? { required: [], pools: new Map() };
      terms.set(r.term, term);
      if (r.elective) {
        const key = r.group ?? "Electives";
        term.pools.set(key, [...(term.pools.get(key) ?? []), r]);
      } else {
        term.required.push(r);
      }
    }

    return [...byYear.entries()]
      .sort(([a], [b]) => a - b)
      .map(([year, terms]) => ({
        year,
        terms: [...terms.entries()].sort(([a], [b]) => a - b),
      }));
  }, [q, rows]);

  return (
    <div className="space-y-4">
      <label className="input flex items-center gap-2">
        <Search size={16} className="shrink-0 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Filter ${rows.length} courses…`}
          aria-label="Filter courses"
          className="w-full bg-transparent outline-none"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Clear filter" className="text-zinc-400 hover:text-zinc-600">
            <X size={16} />
          </button>
        )}
      </label>

      {signedIn && (
        <p className="text-xs muted">Tip: tap the bookmark next to a course to add it to My courses on your home page.</p>
      )}

      {years.map(({ year, terms }) => (
        <details key={year} open className="card group p-0">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span className="text-lg font-semibold">Year {year}</span>
            <ChevronDown size={18} className="text-zinc-400 transition group-open:rotate-180" />
          </summary>

          <div className="space-y-4 px-2 pb-4 sm:px-3">
            {terms.map(([term, { required, pools }]) => (
              <div key={term}>
                <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {TERM_LABEL[term] ?? `Term ${term}`}
                </div>
                {required.map((r) => (
                  <CourseRow key={r.course.id} row={r} pinned={pinned.has(r.course.id)} signedIn={signedIn} />
                ))}
                {[...pools.entries()].map(([label, options]) => (
                  <details key={label} className="group/pool mt-1 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700" open={Boolean(q)}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm">
                      <span className="min-w-0">
                        <span className="font-medium">{label.replace(/:.*$/, "")}</span>
                        <span className="muted">
                          {" "}
                          · {label.includes(":") ? label.split(":").slice(1).join(":").trim() : plural(options.length, "option")}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        {options.some((o) => o.count > 0) && (
                          <span className="badge-success">{options.reduce((n, o) => n + o.count, 0)} files</span>
                        )}
                        <ChevronDown size={16} className={cn("text-zinc-400 transition group-open/pool:rotate-180")} />
                      </span>
                    </summary>
                    <div className="pb-1">
                      {options.map((r) => (
                        <CourseRow key={r.course.id} row={r} pinned={pinned.has(r.course.id)} signedIn={signedIn} />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </details>
      ))}

      {years.length === 0 && <p className="card text-sm muted">No courses match “{q}”.</p>}
    </div>
  );
}
