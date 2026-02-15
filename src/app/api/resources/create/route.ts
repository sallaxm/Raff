import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import pdf from "pdf-parse";
import * as mammoth from "mammoth/mammoth.browser";

export const runtime = "nodejs";

type Body = {
  storage_path: string; // "<uid>/<uuid>-file.ext"
  title: string;
  type: string;
  mode: "course" | "major";
  course_id?: string | null;
  major_id?: string | null;
  institution_id?: string; // default "udst"
};

function extOf(path: string) {
  const p = path.toLowerCase();
  const i = p.lastIndexOf(".");
  return i === -1 ? "" : p.slice(i + 1);
}

async function getPageCountFromBuffer(buf: Buffer, ext: string) {
  if (ext === "pdf") {
    const data = await pdf(buf);
    return Math.max(1, Number(data.numpages || 1));
  }

  if (ext === "docx") {
    // DOCX has no true "pages" without a layout engine.
    // This is an estimate: ~300 words per page.
    const result = await mammoth.extractRawText({ arrayBuffer: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) });
    const text = result.value || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 300));
  }

  // For other formats: keep minimal safe default
  return 1;
}

export async function POST(req: NextRequest) {
  const response = NextResponse.next();

  // Auth client (uses cookies)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Service client (bypasses RLS; use carefully)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const storage_path = (body.storage_path || "").trim();
  const title = (body.title || "").trim();
  const type = (body.type || "").trim();
  const mode = body.mode;

  if (!storage_path || !title || !type || (mode !== "course" && mode !== "major")) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // IMPORTANT: ensure the path belongs to the logged-in user
  // Your storage policy should also enforce this, but we hard-check server-side too.
  if (!storage_path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Invalid storage path" }, { status: 403 });
  }

  const institution_id = (body.institution_id || "udst").trim();

  // Validate mode target
  const course_id = mode === "course" ? (body.course_id ?? null) : null;
  const major_id = mode === "major" ? (body.major_id ?? null) : null;

  if (mode === "course" && !course_id) {
    return NextResponse.json({ error: "course_id required" }, { status: 400 });
  }
  if (mode === "major" && !major_id) {
    return NextResponse.json({ error: "major_id required" }, { status: 400 });
  }

  // Create signed URL so we can download the file
  const { data: signed, error: signErr } = await admin
    .storage
    .from("resources")
    .createSignedUrl(storage_path, 60);

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not access file" }, { status: 400 });
  }

  // Download file and compute page_count
  const ext = extOf(storage_path);
  let page_count = 1;

  try {
    const r = await fetch(signed.signedUrl);
    if (!r.ok) throw new Error(`download failed: ${r.status}`);
    const ab = await r.arrayBuffer();
    const buf = Buffer.from(ab);
    page_count = await getPageCountFromBuffer(buf, ext);
  } catch (e: any) {
    // Don’t block upload if parsing fails — just fallback safely.
    page_count = 1;
  }

  const cost = Math.max(1, Math.ceil(page_count / 5));

  // Insert resource row using service role (no RLS pain)
  const { data: inserted, error: insErr } = await admin
    .from("resources")
    .insert({
      institution_id,
      uploader_id: user.id,
      title,
      type,
      cost,
      page_count,
      storage_path,
      status: "pending",
      course_id,
      major_id,
    })
    .select("id")
    .single();

  if (insErr) {
    // If DB insert fails, clean up file to avoid orphaned uploads
    await admin.storage.from("resources").remove([storage_path]);
    return NextResponse.json({ error: insErr.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    id: inserted.id,
    page_count,
    cost,
  });
}