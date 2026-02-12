import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
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

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ user: null, profile: null }, { status: 200 });
  }

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("credits, role, institution_id")
    .eq("id", user.id)
    .single();

  // If profile is missing (common after resets), create it automatically:
  if (pErr) {
    await supabase.from("profiles").insert({
      id: user.id,
      institution_id: "udst",
      role: "user",
      credits: 8,
    });

    const { data: profile2 } = await supabase
      .from("profiles")
      .select("credits, role, institution_id")
      .eq("id", user.id)
      .single();

    return NextResponse.json({ user: { id: user.id, email: user.email }, profile: profile2 ?? null });
  }

  return NextResponse.json({ user: { id: user.id, email: user.email }, profile });
}