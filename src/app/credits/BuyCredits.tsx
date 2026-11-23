"use client";

import { useState } from "react";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { CREDIT_PACKS } from "@/lib/payments/packs";
import { cn, formatQar } from "@/lib/format";

export default function BuyCredits() {
  const [busyPack, setBusyPack] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function buy(packId: string) {
    setError("");
    setBusyPack(packId);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) {
        setError(json.error ?? "Could not start checkout.");
        setBusyPack(null);
        return;
      }
      window.location.assign(json.url);
    } catch {
      setError("Network error. Check your connection and try again.");
      setBusyPack(null);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="h2">Top up credits</h2>
        <p className="text-sm muted">
          Pay in QAR with NAPS / QPay debit, Visa, Mastercard or Apple Pay.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CREDIT_PACKS.map((pack) => {
          const featured = Boolean(pack.highlight);
          const perCredit = pack.priceQar / pack.credits;
          return (
            <div
              key={pack.id}
              className={cn(
                "card relative flex flex-col",
                featured && "ring-2 ring-blue-400/60 dark:ring-blue-500/50"
              )}
            >
              {pack.highlight && (
                <span className="badge absolute -top-2.5 left-5 bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-sm">
                  {pack.highlight}
                </span>
              )}

              <div className="text-sm font-medium muted">{pack.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">{pack.credits}</span>
                <span className="text-sm muted">credits</span>
              </div>
              <div className="mt-1 text-lg font-semibold">{formatQar(pack.priceQar)}</div>
              <p className="mt-2 flex-1 text-sm muted">{pack.tagline}</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs muted">
                <Check size={14} className="text-emerald-500" />
                {formatQar(Math.round(perCredit * 100) / 100)} per credit
              </div>

              <button
                type="button"
                onClick={() => buy(pack.id)}
                disabled={busyPack !== null}
                className={cn("mt-4 w-full", featured ? "btn-primary" : "btn-secondary")}
              >
                {busyPack === pack.id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Redirecting…
                  </>
                ) : (
                  <>
                    <CreditCard size={16} /> Buy
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="notice-error">{error}</p>}

      <p className="text-xs muted">
        Payments are processed securely by Tap Payments. Raff never sees your card details.
        Credits are added as soon as your payment is confirmed.
      </p>
    </section>
  );
}
