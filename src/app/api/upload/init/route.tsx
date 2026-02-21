import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const TITLE_MAX_LENGTH = 180;
const TYPE_MAX_LENGTH = 60;
const EXT_PATTERN = /^[a-z0-9]{1,10}$/;

function isValidCost(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 100;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { course_id, title, type, cost, ext } = body as {
    course_id: string;
    title: string;
    type: string;
    cost: number;
    ext: string; // "pdf", "docx", etc
  };

  const cleanTitle = title?.trim();
  const cleanType = type?.trim();
  const cleanExt = ext?.trim().toLowerCase();

  if (!course_id || !cleanTitle || !cleanType || !cleanExt || !isValidCost(cost)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (cleanTitle.length > TITLE_MAX_LENGTH || cleanType.length > TYPE_MAX_LENGTH) {
    return NextResponse.json({ error: "Title or type is too long" }, { status: 400 });
  }

  if (!EXT_PATTERN.test(cleanExt)) {
    return NextResponse.json({ error: "Invalid file extension" }, { status: 400 });
  }

  // Read the logged-in user from cookies (Next 16 safe)
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
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  // Use service role ONLY on the server (safe)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Ensure profile exists (useful after local resets)
  await admin
    .from("profiles")
    .upsert(
      {
        id: user.id,
        institution_id: "udst",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );

  // Create resource row first
  const resourceId = crypto.randomUUID();
  const storage_path = `${user.id}/${resourceId}.${cleanExt}`;

  const { data: prof } = await admin
    .from("profiles")
    .select("institution_id")
    .eq("id", user.id)
    .single();

  const institution_id = prof?.institution_id ?? "udst";

  const ins = await admin.from("resources").insert({
    id: resourceId,
    institution_id,
    course_id,
    uploader_id: user.id,
    title: cleanTitle,
    type: cleanType,
    cost,
    status: "pending",
    storage_path,
  });

  if (ins.error) {
    return NextResponse.json({ error: ins.error.message }, { status: 400 });
  }

  // Create a signed upload URL (client will upload using it)
  const signed = await admin.storage.from("resources").createSignedUploadUrl(storage_path);

  if (signed.error) {
    return NextResponse.json({ error: signed.error.message }, { status: 400 });
  }

  return NextResponse.json({
    resource_id: resourceId,
    storage_path,
    signedUrl: signed.data.signedUrl,
    token: signed.data.token,
  });
}
