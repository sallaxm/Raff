import Link from "next/link";
import { FileText } from "lucide-react";
import { cn } from "@/lib/format";
import { plural } from "@/lib/credits";
import PinButton from "./PinButton";

export default function CourseCard({
  course,
  count,
  pinned,
  showPin = true,
  meta,
}: {
  course: { id: string; code: string; name: string };
  count: number;
  pinned?: boolean;
  showPin?: boolean;
  meta?: React.ReactNode;
}) {
  return (
    <Link href={`/course/${course.id}`} className="card card-hover flex items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold tabular-nums">{course.code}</span>
          {meta}
        </div>
        <div className="truncate text-sm muted">{course.name}</div>
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
          count > 0
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        )}
      >
        <FileText size={12} />
        {count > 0 ? plural(count, "file") : "No files yet"}
      </span>
      {showPin && <PinButton courseId={course.id} pinned={Boolean(pinned)} compact />}
    </Link>
  );
}
