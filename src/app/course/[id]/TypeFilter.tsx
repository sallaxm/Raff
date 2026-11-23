import Link from "next/link";
import { cn } from "@/lib/format";

/** Server-rendered type tabs (links), so filtering works without JS and is shareable. */
export default function TypeFilter({
  types,
  active,
  total,
}: {
  types: { type: string; count: number }[];
  active: string | null;
  total: number;
}) {
  return (
    <nav aria-label="Filter by type" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <Link href="?" scroll={false} className={cn("pill shrink-0", !active && "pill-active")}>
        All · {total}
      </Link>
      {types.map(({ type, count }) => (
        <Link
          key={type}
          href={`?type=${encodeURIComponent(type)}`}
          scroll={false}
          className={cn("pill shrink-0", active === type && "pill-active")}
        >
          {type} · {count}
        </Link>
      ))}
    </nav>
  );
}
