import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // Auth from cookies (Next 16 safe)
  const response = NextResponse.next();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: userData } = await supabaseAuth.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // Service role (server-only) to read resource + sign URL
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: resource, error: rErr } = await admin
    .from("resources")
    .select("id, storage_path, status")
    .eq("id", id)
    .single();

  if (rErr || !resource) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (resource.status !== "approved") return NextResponse.json({ error: "Not approved" }, { status: 403 });

  // Optional safety: only allow if the user has a download record
  const { data: dl } = await admin
    .from("downloads")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("resource_id", id)
    .maybeSingle();

  if (!dl) {
    return NextResponse.json({ error: "Pay first" }, { status: 403 });
  }

  const signed = await admin.storage.from("resources").createSignedUrl(resource.storage_path, 15); // 15 seconds
  if (signed.error) return NextResponse.json({ error: signed.error.message }, { status: 400 });

  return NextResponse.json({ url: signed.data.signedUrl });
}