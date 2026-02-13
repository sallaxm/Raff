import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer(); // ✅ FIX: await the server client

  const { id, status } = (await req.json()) as {
    id: string;
    status: "pending" | "approved" | "rejected";
  };

  if (!id || !status) {
    return NextResponse.json({ error: "Missing id/status" }, { status: 400 });
  }

  const { error } = await supabase.from("resources").update({ status }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  return NextResponse.redirect(new URL("/mod", req.url));
}