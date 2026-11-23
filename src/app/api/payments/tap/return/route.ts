import { NextResponse, type NextRequest } from "next/server";
import { siteUrl, syncTapCharge, type PaymentOutcome } from "@/lib/payments/service";

/** Tap redirects the shopper here with ?tap_id=chg_… after checkout. */
export async function GET(req: NextRequest) {
  const chargeId = req.nextUrl.searchParams.get("tap_id");
  let outcome: PaymentOutcome | "error" = "error";

  if (chargeId) {
    try {
      outcome = await syncTapCharge(chargeId);
    } catch (e) {
      console.error("[payments] return sync failed:", e instanceof Error ? e.message : e);
    }
  }

  return NextResponse.redirect(new URL(`/credits?payment=${outcome}`, siteUrl(req.url)), 303);
}
