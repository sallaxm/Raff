import "server-only";

/**
 * Minimal Tap Payments client (https://developers.tap.company).
 *
 * Tap is licensed in Qatar and its hosted checkout (source "src_all") offers
 * NAPS / QPay debit cards, Visa, Mastercard, Apple Pay and Google Pay in QAR.
 * Use an sk_test_… key for sandbox and sk_live_… in production.
 */

const TAP_API = "https://api.tap.company/v2";

export type TapChargeStatus =
  | "INITIATED"
  | "IN_PROGRESS"
  | "CAPTURED"
  | "AUTHORIZED"
  | "ABANDONED"
  | "CANCELLED"
  | "FAILED"
  | "DECLINED"
  | "RESTRICTED"
  | "VOID"
  | "TIMEDOUT"
  | "UNKNOWN";

export type TapCharge = {
  id: string;
  status: TapChargeStatus;
  amount: number;
  currency: string;
  reference?: { transaction?: string; order?: string };
  metadata?: Record<string, string>;
  transaction?: { url?: string };
  response?: { code?: string; message?: string };
};

export function tapConfigured() {
  return Boolean(process.env.TAP_SECRET_KEY);
}

async function tapFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.TAP_SECRET_KEY;
  if (!key) throw new Error("TAP_SECRET_KEY is not set");

  const res = await fetch(`${TAP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const detail =
      body?.errors?.[0]?.description ?? body?.message ?? `HTTP ${res.status}`;
    throw new Error(`Tap API error: ${detail}`);
  }
  return body as T;
}

export async function createTapCharge(input: {
  paymentId: string;
  userId: string;
  amount: number;
  description: string;
  customer: { firstName: string; email: string };
  redirectUrl: string;
  webhookUrl: string;
}): Promise<TapCharge> {
  return tapFetch<TapCharge>("/charges", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amount,
      currency: "QAR",
      customer_initiated: true,
      threeDSecure: true,
      save_card: false,
      description: input.description,
      reference: { transaction: input.paymentId, order: input.paymentId },
      metadata: { payment_id: input.paymentId, user_id: input.userId },
      receipt: { email: true, sms: false },
      customer: {
        first_name: input.customer.firstName,
        email: input.customer.email,
      },
      // "src_all" shows every method enabled on your Tap account (incl. NAPS/QPay).
      source: { id: process.env.TAP_SOURCE_ID || "src_all" },
      post: { url: input.webhookUrl },
      redirect: { url: input.redirectUrl },
    }),
  });
}

export async function retrieveTapCharge(chargeId: string): Promise<TapCharge> {
  if (!/^chg_[A-Za-z0-9]+$/.test(chargeId)) {
    throw new Error("Invalid charge id");
  }
  return tapFetch<TapCharge>(`/charges/${chargeId}`);
}
