"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/format";

/** Add/remove a course from the student's "My courses". */
export default function PinButton({
  courseId,
  pinned: initial,
  compact = false,
}: {
  courseId: string;
  pinned: boolean;
  compact?: boolean;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const [pinned, setPinned] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push("/profile");
      return;
    }

    const next = !pinned;
    setPinned(next);
    const { error } = next
      ? await supabase.from("user_courses").insert({ user_id: auth.user.id, course_id: courseId })
      : await supabase.from("user_courses").delete().eq("user_id", auth.user.id).eq("course_id", courseId);

    if (error && !error.message.includes("duplicate")) setPinned(!next);
    setBusy(false);
    router.refresh();
  }

  const Icon = pinned ? BookmarkCheck : BookmarkPlus;
  const label = pinned ? "In My courses" : "Add to My courses";

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-label={label}
        title={label}
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full transition",
          pinned
            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            : "bg-zinc-100 text-zinc-500 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white"
        )}
      >
        <Icon size={16} />
      </button>
    );
  }

  return (
    <button type="button" onClick={toggle} disabled={busy} className={pinned ? "btn-secondary" : "btn-primary"}>
      <Icon size={16} />
      {label}
    </button>
  );
}
