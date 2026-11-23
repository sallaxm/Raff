import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { cn } from "@/lib/format";
import BuyCredits from "./BuyCredits";

export const metadata: Metadata = { title: "Credits" };

type Tx = {
  id: string;
  amount: number;
  kind: string;
  note: string | null;
  created_at: string;
};

const KIND_LABELS: Record<string, string> = {
  STARTER: "Welcome credits",
  UPLOAD_REWARD: "Upload approved",
  UPLOAD_BONUS: "Upload bonus",
  UPLOAD_EARNING: "Someone downloaded your upload",
  DOWNLOAD: "Downloaded a resource",
  PURCHASE: "Bought credits",
  REFUND: "Refund",
  ADJUSTMENT: "Adjustment by Raff",
  BOOST: "Boosted an upload",
  BOUNTY_CREATE: "Posted a bounty",
  BOUNTY_REFUND: "Bounty refunded",
  BOUNTY_PAYOUT: "Won a bounty",
};

// Upload-reward notes are internal debug strings ("reward=…, base=…"); hide those.
function txDetail(tx: Tx) {
  if (!tx.note || tx.kind === "UPLOAD_REWARD") return null;
  return tx.note;
}

const PAYMENT_BANNERS: Record<string, { cls: string; text: string }> = {
  paid: { cls: "notice-success", text: "Payment received — your credits have been added. Thank you!" },
  pending: { cls: "notice", text: "Your payment is still processing. Credits will appear here once it's confirmed." },
  cancelled: { cls: "notice", text: "Payment cancelled. You haven't been charged." },
  failed: { cls: "notice-error", text: "Your payment didn't go through. You haven't been charged — please try again." },
  error: { cls: "notice-error", text: "We couldn't confirm your payment yet. If you were charged, your credits will arrive shortly." },
};

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const { payment } = await searchParams;
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/profile?next=/credits");

  const [{ data: profile }, { data: txs, error: txErr }] = await Promise.all([
    supabase.from("profiles").select("credits").eq("id", auth.user.id).maybeSingle(),
    supabase
      .from("credit_transactions")
      .select("id, amount, kind, note, created_at")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const rows = (txs ?? []) as Tx[];
  const banner = payment ? PAYMENT_BANNERS[payment] : null;

  return (
    <main className="page-narrow">
      {banner && <p className={banner.cls}>{banner.text}</p>}

      <section className="card-hero">
        <p className="text-sm muted">Available balance</p>
        <p className="mt-1 text-5xl font-semibold tracking-tight">{profile?.credits ?? 0}</p>
        <p className="mt-2 text-sm muted">
          Upload useful material to earn: +2 when approved, then +1 every time someone downloads it. Or top up below.
        </p>
      </section>

      <BuyCredits />

      <section className="space-y-3">
        <h2 className="h2">History</h2>

        {txErr && <p className="notice-error">{txErr.message}</p>}

        {rows.length === 0 ? (
          <p className="card text-sm muted">No transactions yet.</p>
        ) : (
          <ul className="card divide-y divide-zinc-100 p-0 dark:divide-zinc-800">
            {rows.map((tx) => {
              const positive = tx.amount > 0;
              const detail = txDetail(tx);
              return (
                <li key={tx.id} className="flex items-center gap-3 px-5 py-4">
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                      positive
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                    )}
                  >
                    {positive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{KIND_LABELS[tx.kind] ?? tx.kind}</p>
                    <p className="truncate text-xs muted">
                      {new Date(tx.created_at).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {detail ? ` · ${detail}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-semibold tabular-nums",
                      positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                    )}
                  >
                    {positive ? "+" : ""}
                    {tx.amount}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
