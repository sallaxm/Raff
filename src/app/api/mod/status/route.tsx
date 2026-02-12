import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const form = await req.formData();
  const id = String(form.get("id"));
  const status = String(form.get("status"));

  if (!["approved", "removed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabase.from("resources").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });

  return NextResponse.redirect(new URL("/mod", req.url));
}