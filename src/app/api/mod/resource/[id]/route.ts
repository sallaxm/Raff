import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser, isModRole } from "@/lib/supabase/server";

/** Moderator-only: delete a resource row and its stored file. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Missing resource id" }, { status: 400 });
  }

  const { user, role } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (!isModRole(role)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const admin = supabaseAdmin();

  const { data: resource, error: readErr } = await admin
    .from("resources")
    .select("id, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
  if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

  if (resource.storage_path) {
    const { error } = await admin.storage.from("resources").remove([resource.storage_path]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: deleteErr } = await admin.from("resources").delete().eq("id", id);
  if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
