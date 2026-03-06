import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  if (!id) {
    return NextResponse.json({ error: "Missing resource id" }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  const isMod = profile?.role === "mod" || profile?.role === "admin";
  if (!isMod) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { data: resource, error: readErr } = await supabaseAdmin
    .from("resources")
    .select("id,storage_path")
    .eq("id", id)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ error: readErr.message }, { status: 500 });
  }

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  if (resource.storage_path) {
    const { error: storageErr } = await supabaseAdmin.storage
      .from("resources")
      .remove([resource.storage_path]);

    if (storageErr) {
      return NextResponse.json({ error: storageErr.message }, { status: 500 });
    }
  }

  const { error: deleteErr } = await supabaseAdmin
    .from("resources")
    .delete()
    .eq("id", id);

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
