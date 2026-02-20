import { supabaseServer } from "@/lib/supabase/server";
import MajorCoursesClient from "./MajorCoursesClient";

export default async function MajorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await supabaseServer();

  const { data: major } = await supabase
    .from("majors")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!major) {
    return <main className="p-6">Major not found.</main>;
  }

  const { data, error } = await supabase
    .from("major_courses")
    .select(
      `
      year,
      semester,
      is_elective,
      courses (
        id,
        code,
        name
      )
    `
    )
    .eq("major_id", major.id)
    .order("year")
    .order("semester");

  if (error) {
    return <main className="p-6">Error: {error.message}</main>;
  }

  // Pass to client for search/filtering
  return <MajorCoursesClient majorName={major.name} rows={(data ?? [])} />;
}