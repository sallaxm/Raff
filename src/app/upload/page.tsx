import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import UploadForm, { type CourseOption, type ProgramOption } from "./UploadForm";

export const metadata: Metadata = { title: "Upload" };

export default async function UploadPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course: courseId } = await searchParams;
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  const [courseRes, programsRes, profileRes] = await Promise.all([
    courseId
      ? supabase.from("courses").select("id, code, name, institution_id").eq("id", courseId).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("majors").select("id, name, short_name, institution_id").order("name"),
    auth.user
      ? supabase.from("profiles").select("major_id").eq("id", auth.user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <main className="page-narrow">
      <section className="card-hero">
        <h1 className="h1">Upload a file</h1>
        <p className="mt-1 text-sm muted">
          Share notes or past papers for a course and earn credits once a moderator approves them.{" "}
          <Link href="/guidelines" className="underline underline-offset-4">
            Read the guidelines
          </Link>
          .
        </p>
      </section>

      <UploadForm
        initialCourse={(courseRes.data as CourseOption | null) ?? null}
        programs={(programsRes.data ?? []) as ProgramOption[]}
        defaultProgramId={(profileRes.data?.major_id as string | null) ?? null}
      />
    </main>
  );
}
