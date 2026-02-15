import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import * as mammoth from "mammoth";

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

function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  // Buffer.buffer can be ArrayBuffer | SharedArrayBuffer in TS types
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

async function getPageCountFromBuffer(buf: Buffer, ext: string) {
  if (ext === "pdf") {
    const doc = await PDFDocument.load(buf);
    return Math.max(1, doc.getPageCount());
  }

  if (ext === "docx") {
    // DOCX pages are not real without layout; estimate via words (~300 words/page)
    const result = await mammoth.extractRawText({
      arrayBuffer: bufferToArrayBuffer(buf),
    });
    const text = result.value || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 300));
  }

  // Other types: unknown page count
  return 1;
}

export async function POST(req: NextRequest) {
  const response = NextResponse.next();

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

  // hard-check: must belong to logged-in user
  if (!storage_path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Invalid storage path" }, { status: 403 });
  }

  const institution_id = (body.institution_id || "udst").trim();

  const course_id = mode === "course" ? (body.course_id ?? null) : null;
  const major_id = mode === "major" ? (body.major_id ?? null) : null;

  if (mode === "course" && !course_id) {
    return NextResponse.json({ error: "course_id required" }, { status: 400 });
  }
  if (mode === "major" && !major_id) {
    return NextResponse.json({ error: "major_id required" }, { status: 400 });
  }

  // Download file via signed URL (service role)
  const { data: signed, error: signErr } = await admin.storage
    .from("resources")
    .createSignedUrl(storage_path, 60);

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not access file" }, { status: 400 });
  }

  const ext = extOf(storage_path);
  let page_count = 1;

  try {
    const r = await fetch(signed.signedUrl);
    if (!r.ok) throw new Error(`download failed: ${r.status}`);
    const ab = await r.arrayBuffer();
    const buf = Buffer.from(ab);
    page_count = await getPageCountFromBuffer(buf, ext);
  } catch {
    page_count = 1; // fallback; mod can adjust later
  }

  const cost = Math.max(1, Math.ceil(page_count / 5));

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
    await admin.storage.from("resources").remove([storage_path]);
    return NextResponse.json({ error: insErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: inserted.id, page_count, cost });
}

// force TS to treat this file as a module (fixes "is not a module")
export {};