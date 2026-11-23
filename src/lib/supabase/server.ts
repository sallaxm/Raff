import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cookie-bound Supabase client for server components and route handlers. */
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — cookies are read-only there.
            // The proxy refreshes the session, so this is safe to ignore.
          }
        },
      },
    }
  );
}

export type Role = "user" | "mod" | "admin";

export function isModRole(role: string | null | undefined) {
  return role === "mod" || role === "admin";
}

/** Returns the signed-in user and their profile role, or nulls. */
export async function getSessionUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data.user ?? null;

  if (!user) return { supabase, user: null, role: null as Role | null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, role: (profile?.role ?? "user") as Role };
}
