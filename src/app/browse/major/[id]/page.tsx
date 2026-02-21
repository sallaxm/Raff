import { supabaseServer } from "@/lib/supabase/server";
import MajorCoursesClient from "./MajorCoursesClient";

type ClientCourseRow = {
  year: number;
  semester: number;
  is_elective: boolean;
  courses: {
    id: string;
    code: string;
    name: string;
  };
};

type MajorCourseQueryRow = {
  year: number;
  semester: number;
  is_elective: boolean;
  courses: ClientCourseRow["courses"] | ClientCourseRow["courses"][] | null;
};

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

  const rows: ClientCourseRow[] = ((data ?? []) as MajorCourseQueryRow[])
    .map((row) => {
      const course = Array.isArray(row.courses) ? row.courses[0] : row.courses;
      if (!course) return null;

      return {
        year: row.year,
        semester: row.semester,
        is_elective: row.is_elective,
        courses: course,
      };
    })
    .filter((row): row is ClientCourseRow => row !== null);

  // Pass to client for search/filtering
  return <MajorCoursesClient majorName={major.name} rows={rows} />;
}