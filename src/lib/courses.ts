import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type CourseLite = { id: string; code: string; name: string; credits?: number | null };

export const RESOURCE_TYPES = [
  "Past Paper",
  "Notes",
  "Assignment",
  "Lab",
  "Cheat Sheet",
  "Summary",
  "Other",
] as const;

/** Approved-file counts for the given courses (missing = 0). */
export async function getCourseCounts(supabase: SupabaseClient, courseIds: string[]) {
  const counts = new Map<string, number>();
  if (!courseIds.length) return counts;

  const { data } = await supabase
    .from("course_resource_counts")
    .select("course_id, resource_count")
    .in("course_id", courseIds);

  for (const row of data ?? []) counts.set(row.course_id, row.resource_count);
  return counts;
}

/** The signed-in student's pinned courses and program. */
export async function getStudentContext(supabase: SupabaseClient, userId: string | null) {
  if (!userId) return { majorId: null as string | null, pinned: [] as CourseLite[] };

  const [{ data: profile }, { data: pins }] = await Promise.all([
    supabase.from("profiles").select("major_id").eq("id", userId).maybeSingle(),
    supabase
      .from("user_courses")
      .select("created_at, courses ( id, code, name, credits )")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  const pinned = ((pins ?? []) as { courses: CourseLite | CourseLite[] | null }[])
    .map((p) => (Array.isArray(p.courses) ? p.courses[0] : p.courses))
    .filter((c): c is CourseLite => Boolean(c))
    .sort((a, b) => a.code.localeCompare(b.code));

  return { majorId: (profile?.major_id as string | null) ?? null, pinned };
}

/** Escape LIKE wildcards so user input is matched literally. */
export function likePattern(q: string) {
  return `%${q.replace(/[\\%_,()]/g, (c) => `\\${c}`)}%`;
}

/** "MATH 1030" / "math1030" → "MATH1030" so spaced codes still match. */
export function normaliseCode(q: string) {
  return q.replace(/\s+/g, "").toUpperCase();
}
