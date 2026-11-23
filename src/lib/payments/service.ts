import "server-only";

import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { findPack } from "./packs";
import { createTapCharge, retrieveTapCharge, type TapChargeStatus } from "./tap";

const PROVIDER = "tap";

const FAILED_STATUSES: TapChargeStatus[] = [
  "FAILED",
  "DECLINED",
  "RESTRICTED",
  "VOID",
  "TIMEDOUT",
];
const CANCELLED_STATUSES: TapChargeStatus[] = ["CANCELLED", "ABANDONED"];

export type PaymentOutcome = "paid" | "pending" | "failed" | "cancelled";

export function siteUrl(requestUrl: string) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return configured || new URL(requestUrl).origin;
}

/** Creates a pending payment and a Tap charge; returns the hosted checkout URL. */
export async function startCheckout(user: User, packId: string, baseUrl: string) {
  const pack = findPack(packId);
  if (!pack) throw new CheckoutError("Unknown credit pack", 400);
  if (!user.email) throw new CheckoutError("Your account needs an email to pay", 400);

  const admin = supabaseAdmin();

  const { data: payment, error } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      provider: PROVIDER,
      pack_id: pack.id,
      credits: pack.credits,
      amount: pack.priceQar,
      currency: "QAR",
    })
    .select("id")
    .single();

  if (error || !payment) {
    throw new CheckoutError(error?.message ?? "Could not create payment", 500);
  }

  try {
    const charge = await createTapCharge({
      paymentId: payment.id,
      userId: user.id,
      amount: pack.priceQar,
      description: `Raff — ${pack.credits} credits`,
      customer: {
        firstName: user.email.split("@")[0].slice(0, 50) || "Student",
        email: user.email,
      },
      redirectUrl: `${baseUrl}/api/payments/tap/return`,
      webhookUrl: `${baseUrl}/api/payments/tap/webhook`,
    });

    await admin
      .from("payments")
      .update({ provider_ref: charge.id, raw: charge, updated_at: new Date().toISOString() })
      .eq("id", payment.id);

    if (!charge.transaction?.url) {
      throw new Error("Tap did not return a checkout URL");
    }

    return { paymentId: payment.id, checkoutUrl: charge.transaction.url };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "Checkout failed";
    await admin
      .from("payments")
      .update({ status: "failed", failure_reason: reason, updated_at: new Date().toISOString() })
      .eq("id", payment.id);
    throw new CheckoutError(reason, 502);
  }
}

/**
 * Source of truth for payment state. Always re-fetches the charge from Tap
 * (never trusts redirect params or webhook bodies), checks it matches what we
 * expected, and grants credits at most once.
 */
export async function syncTapCharge(chargeId: string): Promise<PaymentOutcome> {
  const charge = await retrieveTapCharge(chargeId);
  const admin = supabaseAdmin();

  const paymentId = charge.metadata?.payment_id ?? charge.reference?.transaction;
  const { data: payment } = await admin
    .from("payments")
    .select("id, status, amount, currency, provider_ref")
    .eq("provider", PROVIDER)
    .eq("id", paymentId ?? "00000000-0000-0000-0000-000000000000")
    .maybeSingle();

  if (!payment) throw new Error(`No payment found for charge ${charge.id}`);
  if (payment.provider_ref && payment.provider_ref !== charge.id) {
    throw new Error(`Charge ${charge.id} does not belong to payment ${payment.id}`);
  }
  if (payment.status === "paid") return "paid";

  if (charge.status === "CAPTURED") {
    const amountMatches = Math.abs(Number(payment.amount) - Number(charge.amount)) < 0.005;
    const currencyMatches = payment.currency === charge.currency;
    if (!amountMatches || !currencyMatches) {
      // Never grant credits on a mismatch. Record it and stop (no webhook retries).
      console.error(`[payments] charge ${charge.id} amount/currency mismatch — needs review`);
      await markPayment(payment.id, "failed", "Amount/currency mismatch", charge);
      return "failed";
    }

    const { error } = await admin.rpc("fulfill_payment", {
      p_payment_id: payment.id,
      p_raw: charge,
    });
    if (error) throw new Error(error.message);
    return "paid";
  }

  if (FAILED_STATUSES.includes(charge.status)) {
    await markPayment(payment.id, "failed", charge.response?.message ?? charge.status, charge);
    return "failed";
  }
  if (CANCELLED_STATUSES.includes(charge.status)) {
    await markPayment(payment.id, "cancelled", charge.status, charge);
    return "cancelled";
  }
  return "pending";
}

async function markPayment(
  id: string,
  status: "failed" | "cancelled",
  reason: string,
  raw: unknown
) {
  await supabaseAdmin()
    .from("payments")
    .update({ status, failure_reason: reason, raw, updated_at: new Date().toISOString() })
    .eq("id", id)
    .neq("status", "paid");
}

export class CheckoutError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}
