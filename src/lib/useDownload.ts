"use client";

import { useCallback, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export type DownloadState =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "done" }
  | { kind: "login" }
  | { kind: "credits"; cost: number }
  | { kind: "error"; message: string };

/**
 * Pay for (first time) and open a resource. Re-downloading something you
 * already own is free.
 */
export function useDownload() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [state, setState] = useState<DownloadState>({ kind: "idle" });

  const download = useCallback(
    async (resourceId: string, cost: number) => {
      setState({ kind: "busy" });

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setState({ kind: "login" });
        return false;
      }

      // Open the tab synchronously-ish so pop-up blockers allow it.
      const tab = window.open("about:blank", "_blank");

      const { error } = await supabase.rpc("spend_credits_and_log_download", {
        p_resource_id: resourceId,
      });

      if (error) {
        const msg = error.message;
        if (msg.includes("Insufficient credits")) {
          tab?.close();
          setState({ kind: "credits", cost });
          return false;
        }
        if (msg.includes("Cannot download your own upload")) {
          tab?.close();
          setState({ kind: "error", message: "This is your own upload — find it in Profile → My uploads." });
          return false;
        }
        if (!msg.includes("Already downloaded")) {
          tab?.close();
          setState({ kind: "error", message: msg.replace(/^.*failed: /, "") });
          return false;
        }
      }

      const res = await fetch(`/api/download/${resourceId}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) {
        tab?.close();
        setState({ kind: "error", message: json.error || "Could not start download" });
        return false;
      }

      if (tab) tab.location.href = json.url;
      else window.location.assign(json.url);

      setState({ kind: "done" });
      return true;
    },
    [supabase]
  );

  return { state, download, reset: () => setState({ kind: "idle" }) };
}
