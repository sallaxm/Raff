import { supabaseServer } from "@/lib/supabase/server";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: course } = await supabase
    .from("courses")
    .select("id, code, name")
    .eq("id", id)
    .maybeSingle();

  if (!course) {
    return <main className="p-6">Course not found.</main>;
  }

  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, type, cost, created_at")
    .eq("course_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{course.code}</h1>
        <p className="text-zinc-500">{course.name}</p>
      </div>

      {resources?.map((r) => (
        <div
          key={r.id}
          className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex justify-between"
        >
          <div>
            <div className="font-semibold">{r.title}</div>
            <div className="text-sm text-zinc-500">{r.type}</div>
          </div>

          <div className="font-semibold">{r.cost} credits</div>
        </div>
      ))}

      {resources?.length === 0 && (
        <p className="text-zinc-500">No resources yet.</p>
      )}
    </main>
  );
}