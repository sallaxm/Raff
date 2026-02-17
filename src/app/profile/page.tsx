"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Resource = {
  id: string;
  title: string;
  status: string;
  rejected_reason: string | null;
};

type DownloadedResource = {
  id: string;
  created_at: string;
  resources: {
    id: string;
    title: string;
    type: string;
  } | null;
};

type DownloadRow = {
  id: string;
  created_at: string;
  resources:
    | {
        id: string;
        title: string;
        type: string;
      }
    | {
        id: string;
        title: string;
        type: string;
      }[]
    | null;
};


export default function ProfilePage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState<number>(0);
  const [uploads, setUploads] = useState<Resource[]>([]);
  const [purchases, setPurchases] = useState<DownloadedResource[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    setUser(data.user);
    setEmail(data.user.email ?? "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", data.user.id)
      .single();

    setCredits(profile?.credits ?? 0);

    const { data: resources } = await supabase
      .from("resources")
      .select("id,title,status,rejected_reason")
      .eq("uploader_id", data.user.id)
      .order("created_at", { ascending: false });

    setUploads(resources ?? []);

    const { data: downloads } = await supabase
      .from("downloads")
      .select(
        `
        id,
        created_at,
        resources ( id, title, type )
      `
      )
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false });

    const normalizedPurchases: DownloadedResource[] = (downloads ?? []).map(
      (download: DownloadRow) => ({
        id: download.id,
        created_at: download.created_at,
        resources: Array.isArray(download.resources)
          ? (download.resources[0] ?? null)
          : download.resources,
      })
    );

    setPurchases(normalizedPurchases);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  async function login() {
    setMsg("");
    setSending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000",
      },
    });

    setSending(false);

    if (error) setMsg(error.message);
    else setMsg("Magic link sent ✉️ Check your email.");
  }

  async function logout() {
    await supabase.auth.signOut();
    location.reload();
  }

  async function redownload(resourceId: string) {
    setMsg("");
    setDownloadingId(resourceId);

    const res = await fetch(`/api/download/${resourceId}`);
    const json = await res.json();

    setDownloadingId(null);

    if (!res.ok) {
      setMsg(json.error || "Could not start download");
      return;
    }

    const newTab = window.open(json.url, "_blank", "noopener,noreferrer");
    if (!newTab) {
      setMsg("Could not open a new tab. Please allow popups and try again.");
      return;
    }

    setMsg("Opened your file in a new tab.");
  }

  // ✅ NOT LOGGED IN
  if (!user) {
    return (
      <main className="max-w-md mx-auto p-8">

        <div className="
          rounded-3xl p-6
          bg-gradient-to-br from-blue-50 via-white to-pink-50
          dark:from-zinc-900 dark:to-zinc-800
          border border-zinc-200 dark:border-zinc-800
        ">
          <h1 className="text-3xl font-semibold">
            Welcome to Raff
          </h1>

          <p className="text-sm text-zinc-500 mt-1">
            Login with your university email.
          </p>

          <input
            type="email"
            placeholder="student@udst.edu.qa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              mt-4 w-full px-4 py-3 rounded-2xl
              border border-zinc-200
              bg-white
              dark:bg-zinc-900 dark:border-zinc-700
              outline-none
              focus:ring-2 focus:ring-blue-200
            "
          />

          <button
            onClick={login}
            disabled={sending}
            className="
              w-full mt-4 py-3 rounded-2xl
              bg-black text-white
              dark:bg-white dark:text-black
              font-medium
              hover:scale-[1.01] transition
              disabled:opacity-50
            "
          >
            {sending ? "Sending..." : "Send Magic Link"}
          </button>

          {msg && (
            <p className="text-sm mt-4 text-zinc-500">
              {msg}
            </p>
          )}
        </div>

      </main>
    );
  }

  // ✅ LOGGED IN
  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">

      {/* Profile Card */}
      <div className="
        rounded-3xl p-6
        bg-gradient-to-br from-blue-50 via-white to-pink-50
        dark:from-zinc-900 dark:to-zinc-800
        border border-zinc-200 dark:border-zinc-800
      ">
        <h1 className="text-3xl font-semibold">
          Profile
        </h1>

        <p className="text-zinc-500 mt-1">
          {email}
        </p>

        <div className="mt-4 font-medium">
          Credits: {credits}
        </div>

        <button
          onClick={logout}
          className="
            mt-4 px-4 py-2 rounded-xl
            border border-zinc-300 dark:border-zinc-700
          "
        >
          Logout
        </button>
      </div>


      {/* Bought resources */}
      <div className="space-y-3">

        <h2 className="text-xl font-semibold">
          Downloaded Resources
        </h2>

        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="
              rounded-2xl p-4
              border border-zinc-200 dark:border-zinc-800
              bg-white dark:bg-zinc-900
            "
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {purchase.resources?.title ?? "Resource"}
                </p>

                <p className="text-xs text-zinc-500 mt-1">
                  {purchase.resources?.type ?? "Unknown type"} • Bought {new Date(purchase.created_at).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => purchase.resources?.id && redownload(purchase.resources.id)}
                disabled={!purchase.resources?.id || downloadingId === purchase.resources.id}
                className="
                  shrink-0 px-4 py-2 rounded-xl text-sm
                  bg-black text-white dark:bg-white dark:text-black
                  disabled:opacity-50
                "
              >
                {downloadingId === purchase.resources?.id ? "Opening..." : "Download again"}
              </button>
            </div>
          </div>
        ))}

        {purchases.length === 0 && (
          <p className="text-zinc-500">
            No downloaded resources yet.
          </p>
        )}

      </div>

      {/* Uploads */}
      <div className="space-y-3">

        <h2 className="text-xl font-semibold">
          My Uploads
        </h2>

        {uploads.map((u) => {

          const statusStyles = {
            approved:
              "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40",

            pending:
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40",

            rejected:
              "bg-red-100 text-red-700 dark:bg-red-900/40",
          };

          return (
            <div
              key={u.id}
              className="
                rounded-2xl p-4
                border border-zinc-200 dark:border-zinc-800
                bg-white dark:bg-zinc-900
              "
            >
              <div className="flex justify-between">

                <p className="font-medium">
                  {u.title}
                </p>

                <div
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${statusStyles[u.status as keyof typeof statusStyles]}
                  `}
                >
                  {u.status}
                </div>

              </div>

              {u.status === "rejected" && u.rejected_reason && (
                <p className="text-xs text-red-500 mt-2">
                  Reason: {u.rejected_reason}
                </p>
              )}

            </div>
          );
        })}

        {uploads.length === 0 && (
          <p className="text-zinc-500">
            No uploads yet.
          </p>
        )}

      </div>

    </main>
  );
}
