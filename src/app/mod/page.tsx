import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ModClient from "./ModClient";

export default async function ModPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isMod = profile?.role === "mod" || profile?.role === "admin";
  if (!isMod) redirect("/");

  // If allowed, render the client UI
  return <ModClient />;
}