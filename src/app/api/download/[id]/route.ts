import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SIGNED_URL_TTL_SECONDS = 15;

/** Returns a short-lived download URL for a resource the user has paid for. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const admin = supabaseAdmin();

  const { data: resource } = await admin
    .from("resources")
    .select("id, storage_path, status")
    .eq("id", id)
    .maybeSingle();

  if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (resource.status !== "approved") {
    return NextResponse.json({ error: "Not approved" }, { status: 403 });
  }

  const { data: download } = await admin
    .from("downloads")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("resource_id", id)
    .maybeSingle();

  if (!download) {
    return NextResponse.json({ error: "Pay first" }, { status: 403 });
  }

  const signed = await admin.storage
    .from("resources")
    .createSignedUrl(resource.storage_path, SIGNED_URL_TTL_SECONDS);

  if (signed.error) {
    return NextResponse.json({ error: signed.error.message }, { status: 400 });
  }

  return NextResponse.json({ url: signed.data.signedUrl });
}
