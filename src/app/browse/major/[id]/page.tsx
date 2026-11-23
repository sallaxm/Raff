import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { one } from "@/lib/format";
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

  if (!major) notFound();

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
    return <main className="page-narrow"><p className="notice-error">{error.message}</p></main>;
  }

  const rows: ClientCourseRow[] = ((data ?? []) as MajorCourseQueryRow[])
    .map((row) => {
      const course = one(row.courses);
      if (!course) return null;

      return {
        year: row.year,
        semester: row.semester,
        is_elective: row.is_elective,
        courses: course,
      };
    })
    .filter((row): row is ClientCourseRow => row !== null);

  return <MajorCoursesClient majorName={major.name} rows={rows} />;
}