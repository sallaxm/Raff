"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Tx = {
  id: string;
  amount: number;
  kind: string;
  note: string | null;
  created_at: string;
};

export default function CreditsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [rows, setRows] = useState<Tx[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      setMsg("Login first.");
      return;
    }

    // get credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", data.user.id)
      .single();

    setBalance(profile?.credits ?? 0);

    // get history
    const { data: tx } = await supabase
      .from("credit_transactions")
      .select("id, amount, kind, note, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    setRows(tx ?? []);
  }

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">

      {/* Balance Card */}
      <div className="
        rounded-3xl p-6
        bg-gradient-to-br from-blue-50 via-white to-pink-50
        dark:from-zinc-900 dark:to-zinc-800
        border border-zinc-200 dark:border-zinc-800
      ">
        <h1 className="text-3xl font-semibold">
          Credits
        </h1>

        <p className="text-4xl font-bold mt-3">
          {balance}
        </p>

        <p className="text-sm text-zinc-500 mt-1">
          Available balance
        </p>
      </div>


      {/* History */}
      <div className="space-y-3">

        <h2 className="text-xl font-semibold">
          History
        </h2>

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
                <p className="font-medium">
                  {tx.note ?? tx.kind}
                </p>

                <p className="text-xs text-zinc-500">
                  {new Date(tx.created_at).toLocaleString()}
                </p>
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
          <p className="text-zinc-500">
            No transactions yet.
          </p>
        )}

      </div>

      {msg && (
        <p className="text-sm text-red-500">
          {msg}
        </p>
      )}

    </main>
  );
}