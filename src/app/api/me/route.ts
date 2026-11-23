import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    return NextResponse.json({ user: null, profile: null });
  }

  // Profiles are created by the handle_new_user() trigger on signup.
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, role, institution_id")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: profile ?? null,
  });
}
