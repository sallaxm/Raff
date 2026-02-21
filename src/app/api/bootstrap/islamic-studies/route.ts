import { NextResponse } from "next/server";
import { ensureIslamicStudiesSeeded } from "@/lib/islamicStudies";

export async function POST() {
  try {
    await ensureIslamicStudiesSeeded();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
