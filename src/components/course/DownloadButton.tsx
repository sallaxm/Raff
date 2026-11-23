"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Download, Loader2 } from "lucide-react";
import { useDownload } from "@/lib/useDownload";
import { plural } from "@/lib/credits";

export default function DownloadButton({
  resourceId,
  cost,
  owned = false,
}: {
  resourceId: string;
  cost: number;
  owned?: boolean;
}) {
  const router = useRouter();
  const { state, download } = useDownload();

  async function onClick() {
    if (await download(resourceId, cost)) router.refresh();
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={state.kind === "busy"}
        className={owned || state.kind === "done" ? "btn-secondary" : "btn-primary"}
      >
        {state.kind === "busy" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : owned || state.kind === "done" ? (
          <Check size={14} />
        ) : (
          <Download size={14} />
        )}
        {owned || state.kind === "done" ? "Open" : `Get · ${cost}`}
      </button>

      {state.kind === "login" && (
        <Link href="/profile" className="text-xs text-rose-500 underline underline-offset-2">
          Log in to download
        </Link>
      )}
      {state.kind === "credits" && (
        <Link href="/credits" className="text-xs text-rose-500 underline underline-offset-2">
          Need {plural(state.cost, "credit")} · Top up
        </Link>
      )}
      {state.kind === "error" && <span className="max-w-[220px] text-right text-xs text-rose-500">{state.message}</span>}
    </div>
  );
}
