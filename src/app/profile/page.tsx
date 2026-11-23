"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { BookOpen, Coins, Download, GraduationCap, LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn, one } from "@/lib/format";

type Upload = {
  id: string;
  title: string;
  status: "approved" | "pending" | "rejected" | string;
  rejected_reason: string | null;
};

type LibraryResource = { id: string; title: string; type: string };

type DownloadRow = {
  id: string;
  created_at: string;
  resources: LibraryResource | LibraryResource[] | null;
};

type Purchase = { id: string; created_at: string; resource: LibraryResource | null };

const STATUS_BADGE: Record<string, string> = {
  approved: "badge-success",
  pending: "badge-warning",
  rejected: "badge-danger",
};

function siteBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? window.location.origin;
}

/* ------------------------------------------------------------------ */
/* Signed-out view                                                     */
/* ------------------------------------------------------------------ */

function AuthCard() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!email || !password) {
      setMsg("Please enter both email and password.");
      return;
    }

    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg(error.message);

      const next = new URLSearchParams(window.location.search).get("next");
      window.location.replace(next?.startsWith("/") ? next : "/profile");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${siteBaseUrl()}/auth/callback` },
    });
    setBusy(false);

    if (error) return setMsg(error.message);
    if (!data.user?.identities?.length) {
      return setMsg("This email is already registered. Try logging in or reset your password.");
    }
    setMsg("Confirmation link sent — check your inbox (and spam), then log in.");
  }

  async function resetPassword() {
    setMsg("");
    if (!email) return setMsg("Enter your email first, then tap “Forgot password”.");

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteBaseUrl()}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    setMsg(error ? error.message : "Password reset link sent — check your inbox.");
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <form onSubmit={submit} className="card-hero space-y-4">
        <div>
          <h1 className="h1">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm muted">
            {mode === "login"
              ? "Log in with your email and password."
              : "Sign up to start uploading and downloading resources. You get 10 free credits."}
          </p>
        </div>

        <div className="segmented">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMsg("");
                setMode(m);
              }}
              className={cn("segment", mode === m && "segment-active")}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <input
            type="email"
            autoComplete="email"
            placeholder="you@university.edu.qa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>

        <button type="submit" disabled={busy} className="btn-primary btn-lg w-full">
          {busy ? "Working…" : mode === "login" ? "Log in" : "Create account"}
        </button>

        {mode === "login" && (
          <button
            type="button"
            onClick={resetPassword}
            disabled={busy}
            className="text-sm muted underline underline-offset-4 hover:text-zinc-900 dark:hover:text-white"
          >
            Forgot password?
          </button>
        )}

        {msg && <p className="notice">{msg}</p>}
      </form>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Change password                                                     */
/* ------------------------------------------------------------------ */

function ChangePassword({ email }: { email: string }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmNext, setConfirmNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const fail = (text: string) => setMsg({ ok: false, text });
    if (!current || !next || !confirmNext) return fail("Please fill all password fields.");
    if (next.length < 6) return fail("New password must be at least 6 characters.");
    if (next !== confirmNext) return fail("New passwords do not match.");
    if (current === next) return fail("New password must be different from the current one.");

    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: current });
    if (signInError) {
      setBusy(false);
      return fail("Current password is incorrect.");
    }

    const { error } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (error) return fail(error.message);

    setCurrent("");
    setNext("");
    setConfirmNext("");
    setMsg({ ok: true, text: "Password updated." });
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <div>
        <h2 className="h2">Change password</h2>
        <p className="text-xs muted">Update your password while signed in.</p>
      </div>
      <input type="password" autoComplete="current-password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} className="input" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input type="password" autoComplete="new-password" placeholder="New password" value={next} onChange={(e) => setNext(e.target.value)} className="input" />
        <input type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirmNext} onChange={(e) => setConfirmNext(e.target.value)} className="input" />
      </div>
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? "Updating…" : "Update password"}
      </button>
      {msg && <p className={msg.ok ? "notice-success" : "notice-error"}>{msg.text}</p>}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [credits, setCredits] = useState(0);
  const [program, setProgram] = useState<{ id: string; name: string } | null>(null);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [stats, setStats] = useState<Record<string, { downloads: number; earned: number }>>({});
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [tab, setTab] = useState<"uploads" | "downloaded">("uploads");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setReady(true);
      return;
    }
    const uid = data.user.id;

    const [{ data: profile }, { data: resources }, { data: downloads }, { count: pins }, { data: uploadStats }] = await Promise.all([
      supabase.from("profiles").select("credits, majors ( id, name )").eq("id", uid).maybeSingle(),
      supabase
        .from("resources")
        .select("id, title, status, rejected_reason")
        .eq("uploader_id", uid)
        .order("created_at", { ascending: false }),
      supabase
        .from("downloads")
        .select("id, created_at, resources ( id, title, type )")
        .eq("user_id", uid)
        .order("created_at", { ascending: false }),
      supabase.from("user_courses").select("course_id", { count: "exact", head: true }).eq("user_id", uid),
      supabase.from("my_upload_stats").select("resource_id, downloads, earned"),
    ]);

    setUser(data.user);
    setCredits(profile?.credits ?? 0);
    setProgram(one(profile?.majors as { id: string; name: string } | { id: string; name: string }[] | null));
    setPinnedCount(pins ?? 0);
    setStats(
      Object.fromEntries(
        ((uploadStats ?? []) as { resource_id: string; downloads: number; earned: number }[]).map((r) => [
          r.resource_id,
          { downloads: r.downloads, earned: r.earned },
        ])
      )
    );
    setUploads((resources ?? []) as Upload[]);
    setPurchases(
      ((downloads ?? []) as DownloadRow[]).map((d) => ({
        id: d.id,
        created_at: d.created_at,
        resource: one(d.resources),
      }))
    );
    setReady(true);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/");
  }

  async function redownload(resourceId: string) {
    setMsg("");
    setDownloadingId(resourceId);
    const res = await fetch(`/api/download/${resourceId}`);
    const json = await res.json().catch(() => ({}));
    setDownloadingId(null);

    if (!res.ok) return setMsg(json.error || "Could not start download");
    if (!window.open(json.url, "_blank", "noopener,noreferrer")) {
      setMsg("Your browser blocked the new tab. Allow pop-ups and try again.");
    }
  }

  if (!ready) {
    return (
      <main className="page-narrow">
        <div className="card-hero h-40 animate-pulse" />
      </main>
    );
  }

  if (!user) return <AuthCard />;

  const approved = uploads.filter((u) => u.status === "approved").length;

  return (
    <main className="page-narrow">
      <section className="card-hero">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="h1">Profile</h1>
            <p className="mt-1 truncate muted">{user.email}</p>
          </div>
          <button type="button" onClick={logout} className="btn-secondary">
            <LogOut size={14} /> Log out
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Credits", value: credits },
            { label: "Approved uploads", value: approved },
            { label: "Downloads", value: purchases.length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/70 p-3 dark:bg-zinc-900/60">
              <div className="text-2xl font-semibold">{stat.value}</div>
              <div className="text-xs muted">{stat.label}</div>
            </div>
          ))}
        </div>

        <Link href="/credits" className="btn-primary mt-4">
          <Coins size={14} /> Top up credits
        </Link>
      </section>

      <section className="card flex flex-wrap items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <GraduationCap size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs muted">My program</div>
          <div className="truncate font-semibold">{program?.name ?? "Not chosen yet"}</div>
          <div className="text-xs muted">{pinnedCount} pinned course{pinnedCount === 1 ? "" : "s"}</div>
        </div>
        <div className="flex gap-2">
          {program && (
            <Link href={`/browse/major/${program.id}`} className="btn-secondary">
              <BookOpen size={14} /> Study plan
            </Link>
          )}
          <Link href="/browse" className={program ? "btn-ghost" : "btn-primary"}>
            {program ? "Change" : "Choose program"}
          </Link>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="h2">My library</h2>
        </div>

        <div className="segmented">
          <button type="button" onClick={() => setTab("uploads")} className={cn("segment", tab === "uploads" && "segment-active")}>
            My uploads ({uploads.length})
          </button>
          <button type="button" onClick={() => setTab("downloaded")} className={cn("segment", tab === "downloaded" && "segment-active")}>
            Downloaded ({purchases.length})
          </button>
        </div>

        {msg && <p className="notice-error">{msg}</p>}

        {tab === "downloaded" ? (
          purchases.length === 0 ? (
            <p className="text-sm muted">
              Nothing downloaded yet. <Link href="/resources" className="underline underline-offset-4">Browse resources →</Link>
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {purchases.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.resource?.title ?? "Deleted resource"}</p>
                    <p className="text-xs muted">
                      {p.resource?.type ?? "—"} · {new Date(p.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  {p.resource && (
                    <button
                      type="button"
                      onClick={() => redownload(p.resource!.id)}
                      disabled={downloadingId === p.resource.id}
                      className="btn-secondary shrink-0"
                    >
                      <Download size={14} />
                      {downloadingId === p.resource.id ? "Opening…" : "Download"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )
        ) : uploads.length === 0 ? (
          <p className="text-sm muted">
            No uploads yet. <Link href="/upload" className="underline underline-offset-4">Upload your first resource →</Link>
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {uploads.map((u) => (
              <li key={u.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate font-medium">{u.title}</p>
                  <span className={cn("shrink-0 capitalize", STATUS_BADGE[u.status] ?? "badge-neutral")}>{u.status}</span>
                </div>
                {u.status === "approved" && (
                  <p className="mt-1 text-xs muted">
                    {stats[u.id]
                      ? `${stats[u.id].downloads} download${stats[u.id].downloads === 1 ? "" : "s"} · earned ${stats[u.id].earned} credit${stats[u.id].earned === 1 ? "" : "s"}`
                      : "No downloads yet — you earn 1 credit each time someone gets it"}
                  </p>
                )}
                {u.status === "rejected" && u.rejected_reason && (
                  <p className="mt-1 text-xs text-rose-500">Reason: {u.rejected_reason}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ChangePassword email={user.email ?? ""} />
    </main>
  );
}
