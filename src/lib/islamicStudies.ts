import "server-only";

import { supabaseAdmin as getAdmin } from "@/lib/supabase/admin";

type CollegeRow = { id: string };

export async function ensureIslamicStudiesSeeded() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const supabaseAdmin = getAdmin();

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
