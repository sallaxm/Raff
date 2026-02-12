import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function CollegeMajorsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ Next 16 requires awaiting params
  const { slug } = await params;

  const supabase = await supabaseServer();

  // Get the college
  const { data: college, error: collegeError } = await supabase
    .from("colleges")
    .select("id, name, institution_id, slug")
    .eq("institution_id", "udst")
    .eq("slug", slug)
    .maybeSingle(); // safer than .single()

  if (collegeError) {
    return <main className="p-6">Error: {collegeError.message}</main>;
  }

  if (!college) {
    return <main className="p-6">College not found.</main>;
  }

  // Get majors inside this college
  const { data: majors, error: majorsError } = await supabase
    .from("majors")
    .select("id, name")
    .eq("institution_id", "udst")
    .eq("college_id", college.id)
    .order("name");

  if (majorsError) {
    return <main className="p-6">Error: {majorsError.message}</main>;
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{college.name}</h1>
          <p className="text-zinc-500">Majors</p>
        </div>

        <Link
          href="/browse"
          className="text-sm px-3 py-2 rounded-full border border-zinc-200 dark:border-zinc-700"
        >
          Back
        </Link>
      </div>

      <div className="space-y-3">
        {majors?.map((m) => (
          <Link
            key={m.id}
            href={`/browse/major/${m.id}`}
            className="
              block p-5 rounded-3xl border border-zinc-200 bg-white shadow-sm
              hover:shadow-md transition
              dark:bg-zinc-900 dark:border-zinc-800
            "
          >
            <div className="text-lg font-semibold">{m.name}</div>
          </Link>
        ))}
      </div>

      {(!majors || majors.length === 0) && (
        <p className="text-zinc-500">No majors found.</p>
      )}
    </main>
  );
}