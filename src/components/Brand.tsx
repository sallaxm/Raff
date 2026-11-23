import Link from "next/link";

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-pink-500 text-sm font-bold text-white shadow-sm">
        R
      </span>
      <span>
        <span className="block font-semibold tracking-tight">Raff</span>
        {!compact && <span className="block text-xs muted">Student resource exchange</span>}
      </span>
    </Link>
  );
}
