import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params; // ✅ IMPORTANT

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: resource, error: rErr } = await admin
    .from("resources")
    .select("storage_path,status")
    .eq("id", id)
    .maybeSingle();

  if (rErr) {
    return NextResponse.json({ error: "DB error", debug: { message: rErr.message } }, { status: 500 });
  }

  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isMod && resource.status !== "approved") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { data, error } = await admin.storage
    .from("resources")
    .createSignedUrl(resource.storage_path, 60 * 10);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Signed URL failed" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}