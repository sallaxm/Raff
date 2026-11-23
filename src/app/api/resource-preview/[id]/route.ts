import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser, isModRole } from "@/lib/supabase/server";

const PREVIEW_TTL_SECONDS = 60 * 10;

/** Signed preview URL. Mods can preview anything; others only approved files. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const { user, role } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const admin = supabaseAdmin();

  const { data: resource, error: readErr } = await admin
    .from("resources")
    .select("storage_path, status")
    .eq("id", id)
    .maybeSingle();

  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
  if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!isModRole(role) && resource.status !== "approved") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { data, error } = await admin.storage
    .from("resources")
    .createSignedUrl(resource.storage_path, PREVIEW_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Signed URL failed" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
