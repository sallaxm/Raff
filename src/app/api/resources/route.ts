import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ resources: [] });
  }

  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, type, cost, status, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  return NextResponse.json({ resources: resources ?? [] });
}
