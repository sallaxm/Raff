import { NextResponse, type NextRequest } from "next/server";
import { syncTapCharge } from "@/lib/payments/service";

/**
 * Tap server-to-server notification ("post.url"). This makes sure credits
 * arrive even if the user closes the tab before being redirected back.
 * We only read the charge id from the body and re-fetch it from Tap, so a
 * forged webhook can't grant credits.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const chargeId = body?.id;

  if (!chargeId || !chargeId.startsWith("chg_")) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const outcome = await syncTapCharge(chargeId);
    return NextResponse.json({ ok: true, outcome });
  } catch (e) {
    console.error("[payments] webhook sync failed:", e instanceof Error ? e.message : e);
    // Non-2xx makes Tap retry later.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
