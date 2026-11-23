"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, GraduationCap } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SetProgramButton({ majorId, isMine }: { majorId: string; isMine: boolean }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const [mine, setMine] = useState(isMine);
  const [busy, setBusy] = useState(false);

  async function setProgram() {
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push("/profile");
      return;
    }
    const { error } = await supabase.from("profiles").update({ major_id: majorId }).eq("id", auth.user.id);
    setBusy(false);
    if (!error) {
      setMine(true);
      router.refresh();
    }
  }

  if (mine) {
    return (
      <span className="btn-secondary cursor-default">
        <Check size={16} /> My program
      </span>
    );
  }

  return (
    <button type="button" onClick={setProgram} disabled={busy} className="btn-primary">
      <GraduationCap size={16} /> This is my program
    </button>
  );
}
