import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { CheckoutError, siteUrl, startCheckout } from "@/lib/payments/service";
import { tapConfigured } from "@/lib/payments/tap";

/** POST { packId } → { url } of the hosted payment page. */
export async function POST(req: NextRequest) {
  if (!tapConfigured()) {
    return NextResponse.json(
      { error: "Payments aren't set up yet. Please try again later." },
      { status: 503 }
    );
  }

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { packId?: string } | null;
  if (!body?.packId) {
    return NextResponse.json({ error: "Missing packId" }, { status: 400 });
  }

  try {
    const { checkoutUrl } = await startCheckout(auth.user, body.packId, siteUrl(req.url));
    return NextResponse.json({ url: checkoutUrl });
  } catch (e) {
    const status = e instanceof CheckoutError ? e.status : 500;
    const message = e instanceof Error ? e.message : "Checkout failed";
    console.error("[payments] checkout failed:", message);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status });
  }
}
