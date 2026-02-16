"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Tx = {
  id: string;
  user_id?: string;
  amount: number;
  kind: string;
  note: string | null;
  created_at: string;
};

function formatTxTitle(tx: Tx) {
  // If you stored a human note, prefer it.
  if (tx.note && tx.note.trim()) return tx.note.trim();

  const kind = (tx.kind || "").toUpperCase();

  // Common kinds (adjust names if yours differ)
  if (kind.includes("UPLOAD")) return "Earned credits from an upload";
  if (kind.includes("DOWNLOAD")) return "Spent credits to download a resource";
  if (kind.includes("PURCHASE")) return "Purchased credits";
  if (kind.includes("REFUND")) return "Refunded credits";
  if (kind.includes("ADJUST")) return "Admin adjustment";

  // Fallback
  return tx.kind || "Transaction";
}

function formatTxSubtitle(tx: Tx) {
  const d = new Date(tx.created_at);
  const when = d.toLocaleString();

  const amt = tx.amount;
  if (amt > 0) return `${when} • +${amt} credits`;
  if (amt < 0) return `${when} • ${amt} credits`;
  return `${when} • 0 credits`;
}

export default function CreditsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [rows, setRows] = useState<Tx[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ensureProfile(uid: string) {
    // Try read
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", uid)
      .maybeSingle();

    if (!error && profile) return profile;

    // If missing, try create (works only if you have profiles_insert_own RLS policy)
    const { data: inserted } = await supabase
      .from("profiles")
      .insert({
        id: uid,
        institution_id: "udst",
        role: "user",
        credits: 0,
      })
      .select("credits")
      .maybeSingle();

    return inserted ?? null;
  }

  async function load() {
    setMsg("");

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setMsg("Login first.");
      return;
    }

    const uid = data.user.id;

    // credits balance
    const profile = await ensureProfile(uid);
    setBalance(profile?.credits ?? 0);

    // history (IMPORTANT: filter to this user)
    const { data: tx, error: txErr } = await supabase
      .from("credit_transactions")
      .select("id, amount, kind, note, created_at, user_id")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(50);

    if (txErr) {
      setMsg(txErr.message);
      setRows([]);
      return;
    }

    setRows((tx ?? []) as Tx[]);
  }

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      {/* Balance Card */}
      <div
        className="
        rounded-3xl p-6
        bg-gradient-to-br from-blue-50 via-white to-pink-50
        dark:from-zinc-900 dark:to-zinc-800
        border border-zinc-200 dark:border-zinc-800
      "
      >
        <h1 className="text-3xl font-semibold">Credits</h1>

        <p className="text-4xl font-bold mt-3">{balance}</p>

        <p className="text-sm text-zinc-500 mt-1">Available balance</p>
      </div>

      {/* History */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">History</h2>

        {rows.map((tx) => {
          const positive = tx.amount > 0;

          return (
            <div
              key={tx.id}
              className="
                flex justify-between items-center
                rounded-2xl p-4
                border border-zinc-200
                dark:border-zinc-800
                bg-white dark:bg-zinc-900
              "
            >
              <div>
                <p className="font-medium">{formatTxTitle(tx)}</p>

                <p className="text-xs text-zinc-500">{formatTxSubtitle(tx)}</p>
              </div>

              <div
                className={`
                  font-semibold
                  ${positive ? "text-emerald-600" : "text-red-500"}
                `}
              >
                {positive ? "+" : ""}
                {tx.amount}
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <p className="text-zinc-500">No transactions yet.</p>
        )}
      </div>

      {msg && <p className="text-sm text-red-500">{msg}</p>}
    </main>
  );
}