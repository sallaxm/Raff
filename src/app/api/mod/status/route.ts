import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser, isModRole } from "@/lib/supabase/server";

const STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number];

export async function POST(req: NextRequest) {
  const { supabase, user, role } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (!isModRole(role)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { id?: string; status?: Status } | null;
  if (!body?.id || !body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Missing or invalid id/status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("resources")
    .update({ status: body.status })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  return NextResponse.redirect(new URL("/mod", req.url));
}
