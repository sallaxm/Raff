import { createBrowserClient } from "@supabase/ssr";

export function supabaseBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During static prerender there's no window; return a stub so builds
    // without env vars don't crash. Real usage always happens client-side.
    if (typeof window === "undefined") {
      return {} as unknown as ReturnType<typeof createBrowserClient>;
    }

    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
