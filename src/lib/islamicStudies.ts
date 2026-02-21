import "server-only";

import { createClient } from "@supabase/supabase-js";

type CollegeRow = { id: string };

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

export async function ensureIslamicStudiesSeeded() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return;

  await supabaseAdmin.from("institutions").upsert(
    { id: "open-institution", name: "Open Institution", status: "active" },
    { onConflict: "id" }
  );

  await supabaseAdmin.from("colleges").upsert(
    {
      institution_id: "open-institution",
      slug: "islamic-studies",
      name: "Islamic Studies",
    },
    { onConflict: "institution_id,slug" }
  );

  const { data: college } = await supabaseAdmin
    .from("colleges")
    .select("id")
    .eq("institution_id", "open-institution")
    .eq("slug", "islamic-studies")
    .maybeSingle<CollegeRow>();

  if (!college?.id) return;

  await supabaseAdmin.from("majors").upsert(
    {
      institution_id: "open-institution",
      college: "islamic-studies",
      college_id: college.id,
      slug: "islamic-studies-general",
      name: "Islamic Studies",
    },
    { onConflict: "institution_id,slug" }
  );
}
