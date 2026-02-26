"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Resource = {
  id: string;
  title: string;
  status: string;
  rejected_reason: string | null;
};

type DownloadedResource = {
  id: string;
  created_at: string;
  resources: {
    id: string;
    title: string;
    type: string;
  } | null;
};

type DownloadRow = {
  id: string;
  created_at: string;
  resources:
    | {
        id: string;
        title: string;
        type: string;
      }
    | {
        id: string;
        title: string;
        type: string;
      }[]
    | null;
};


export default function ProfilePage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [credits, setCredits] = useState<number>(0);
  const [uploads, setUploads] = useState<Resource[]>([]);
  const [purchases, setPurchases] = useState<DownloadedResource[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [changeCurrentPassword, setChangeCurrentPassword] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");
  const [changeConfirmPassword, setChangeConfirmPassword] = useState("");
  const [changePasswordMsg, setChangePasswordMsg] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"uploads" | "downloaded">("uploads");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    setUser(data.user);
    setEmail(data.user.email ?? "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", data.user.id)
      .single();

    setCredits(profile?.credits ?? 0);

    const { data: resources } = await supabase
      .from("resources")
      .select("id,title,status,rejected_reason")
      .eq("uploader_id", data.user.id)
      .order("created_at", { ascending: false });

    setUploads(resources ?? []);

    const { data: downloads } = await supabase
      .from("downloads")
      .select(
        `
        id,
        created_at,
        resources ( id, title, type )
      `
      )
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false });

    const normalizedPurchases: DownloadedResource[] = (downloads ?? []).map(
      (download: DownloadRow) => ({
        id: download.id,
        created_at: download.created_at,
        resources: Array.isArray(download.resources)
          ? (download.resources[0] ?? null)
          : download.resources,
      })
    );

    setPurchases(normalizedPurchases);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  async function login() {
    setMsg("");

    if (!email || !password) {
      setMsg("Please enter both email and password.");
      return;
    }

    setSending(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSending(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    location.reload();
  }

  async function signup() {
    setMsg("");

    if (!email || !password) {
      setMsg("Please enter both email and password.");
      return;
    }

    setSending(true);

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      window.location.origin;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    });

    setSending(false);

    if (error) {
      if (error.status === 500) {
        setMsg("Signup is temporarily unavailable due to a server issue. Please try again in a moment or use Reset password if your account already exists.");
      } else {
        setMsg(error.message);
      }
      return;
    }

    if (!data.user?.identities?.length) {
      setMsg("This email is already registered. Try Login or reset your password.");
      return;
    }

    setMsg("Confirmation link sent. Check your inbox/spam, then log in.");
  }


  async function resetPassword() {
    setMsg("");

    if (!email) {
      setMsg("Enter your email first, then click Reset password.");
      return;
    }

    setSending(true);

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,
    });

    setSending(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Password reset link sent. Check your inbox/spam.");
  }

  async function logout() {
    await supabase.auth.signOut();
    location.reload();
  }

  async function changePassword() {
    setChangePasswordMsg("");

    if (!user?.email) {
      setChangePasswordMsg("Could not verify your account email. Please try again.");
      return;
    }

    if (!changeCurrentPassword || !changeNewPassword || !changeConfirmPassword) {
      setChangePasswordMsg("Please fill all password fields.");
      return;
    }

    if (changeNewPassword.length < 6) {
      setChangePasswordMsg("New password must be at least 6 characters.");
      return;
    }

    if (changeNewPassword !== changeConfirmPassword) {
      setChangePasswordMsg("New passwords do not match.");
      return;
    }

    if (changeCurrentPassword === changeNewPassword) {
      setChangePasswordMsg("New password must be different from current password.");
      return;
    }

    setChangingPassword(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: changeCurrentPassword,
    });

    if (signInError) {
      setChangingPassword(false);
      setChangePasswordMsg("Current password is incorrect.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: changeNewPassword,
    });

    setChangingPassword(false);

    if (updateError) {
      setChangePasswordMsg(updateError.message);
      return;
    }

    setChangeCurrentPassword("");
    setChangeNewPassword("");
    setChangeConfirmPassword("");
    setChangePasswordMsg("Password updated successfully.");
  }

  async function redownload(resourceId: string) {
    setMsg("");
    setDownloadingId(resourceId);

    const res = await fetch(`/api/download/${resourceId}`);
    const json = await res.json();

    setDownloadingId(null);

    if (!res.ok) {
      setMsg(json.error || "Could not start download");
      return;
    }

    const newTab = window.open(json.url, "_blank", "noopener,noreferrer");
    if (!newTab) {
      setMsg("Could not open a new tab. Please allow popups and try again.");
      return;
    }

    setMsg("Opened your file in a new tab.");
  }

  // NOT LOGGED IN
  if (!user) {
    return (
      <main className="max-w-md mx-auto p-8">

        <div className="
          rounded-3xl p-6
          bg-gradient-to-br from-blue-50 via-white to-pink-50
          dark:from-zinc-900 dark:to-zinc-800
          border border-zinc-200 dark:border-zinc-800
        ">
          <h1 className="text-3xl font-semibold">
            {authMode === "login" ? "Welcome back" : "Create your account"}
          </h1>

          <p className="text-sm text-zinc-500 mt-1">
            {authMode === "login"
              ? "Login with your email and password."
              : "Sign up to start uploading and downloading resources."}
          </p>

          <input
            type="email"
            placeholder="student@udst.edu.qa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              mt-4 w-full px-4 py-3 rounded-2xl
              border border-zinc-200
              bg-white
              dark:bg-zinc-900 dark:border-zinc-700
              outline-none
              focus:ring-2 focus:ring-blue-200
            "
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              mt-3 w-full px-4 py-3 rounded-2xl
              border border-zinc-200
              bg-white
              dark:bg-zinc-900 dark:border-zinc-700
              outline-none
              focus:ring-2 focus:ring-blue-200
            "
          />

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-1 bg-white dark:bg-zinc-900">
            <button
              onClick={() => {
                setMsg("");
                setAuthMode("login");
              }}
              className={`py-2 rounded-xl text-sm font-medium transition ${
                authMode === "login"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 dark:text-zinc-300"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => {
                setMsg("");
                setAuthMode("signup");
              }}
              className={`py-2 rounded-xl text-sm font-medium transition ${
                authMode === "signup"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 dark:text-zinc-300"
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <button
              onClick={authMode === "login" ? login : signup}
              disabled={sending}
              className="
                py-3 rounded-2xl
                bg-black text-white
                dark:bg-white dark:text-black
                font-medium
                hover:scale-[1.01] transition
                disabled:opacity-50
              "
            >
              {sending ? "Working..." : authMode === "login" ? "Login" : "Sign up"}
            </button>
          </div>

          {authMode === "login" && (
            <button
              onClick={resetPassword}
              disabled={sending}
              className="
                mt-3 text-sm underline underline-offset-4
                text-zinc-600 dark:text-zinc-300
                disabled:opacity-50
              "
            >
              {sending ? "Working..." : "Reset password"}
            </button>
          )}

          {msg && (
            <p className="text-sm mt-4 text-zinc-500">
              {msg}
            </p>
          )}
        </div>

      </main>
    );
  }

  // LOGGED IN
  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">

      {/* Profile Card */}
      <div className="
        rounded-3xl p-6
        bg-gradient-to-br from-blue-50 via-white to-pink-50
        dark:from-zinc-900 dark:to-zinc-800
        border border-zinc-200 dark:border-zinc-800
      ">
        <h1 className="text-3xl font-semibold">
          Profile
        </h1>

        <p className="text-zinc-500 mt-1">
          {email}
        </p>

        <div className="mt-4 font-medium">
          Credits: {credits}
        </div>

        <button
          onClick={logout}
          className="
            mt-4 px-4 py-2 rounded-xl
            border border-zinc-300 dark:border-zinc-700
          "
        >
          Logout
        </button>

        <div className="mt-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4 bg-white/70 dark:bg-zinc-900/70">
          <h2 className="text-lg font-semibold">Change password</h2>
          <p className="text-xs text-zinc-500 mt-1">Update your password while signed in.</p>

          <input
            type="password"
            placeholder="Current password"
            value={changeCurrentPassword}
            onChange={(e) => setChangeCurrentPassword(e.target.value)}
            className="
              mt-4 w-full px-4 py-3 rounded-2xl
              border border-zinc-200
              bg-white
              dark:bg-zinc-900 dark:border-zinc-700
              outline-none
              focus:ring-2 focus:ring-blue-200
            "
          />

          <input
            type="password"
            placeholder="New password"
            value={changeNewPassword}
            onChange={(e) => setChangeNewPassword(e.target.value)}
            className="
              mt-3 w-full px-4 py-3 rounded-2xl
              border border-zinc-200
              bg-white
              dark:bg-zinc-900 dark:border-zinc-700
              outline-none
              focus:ring-2 focus:ring-blue-200
            "
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={changeConfirmPassword}
            onChange={(e) => setChangeConfirmPassword(e.target.value)}
            className="
              mt-3 w-full px-4 py-3 rounded-2xl
              border border-zinc-200
              bg-white
              dark:bg-zinc-900 dark:border-zinc-700
              outline-none
              focus:ring-2 focus:ring-blue-200
            "
          />

          <button
            onClick={changePassword}
            disabled={changingPassword}
            className="
              mt-4 px-4 py-2 rounded-xl
              bg-black text-white
              dark:bg-white dark:text-black
              font-medium
              disabled:opacity-50
            "
          >
            {changingPassword ? "Updating..." : "Update password"}
          </button>

          {changePasswordMsg && (
            <p className="text-sm mt-3 text-zinc-500">{changePasswordMsg}</p>
          )}
        </div>
      </div>


      {/* Library tabs */}
      <div className="space-y-4 rounded-3xl p-4 border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Library</h2>
          <p className="text-xs text-zinc-500">Switch between uploads and downloaded files</p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-1 bg-white dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "uploads"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            My Uploads ({uploads.length})
          </button>

          <button
            onClick={() => setActiveTab("downloaded")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "downloaded"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            Downloaded ({purchases.length})
          </button>
        </div>

        {activeTab === "downloaded" ? (
          <div className="space-y-3">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="
                  rounded-2xl p-4
                  border border-zinc-200 dark:border-zinc-800
                  bg-white dark:bg-zinc-900
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{purchase.resources?.title ?? "Resource"}</p>

                    <p className="text-xs text-zinc-500 mt-1">
                      {purchase.resources?.type ?? "Unknown type"} • Bought {new Date(purchase.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => purchase.resources?.id && redownload(purchase.resources.id)}
                    disabled={!purchase.resources?.id || downloadingId === purchase.resources.id}
                    className="
                      shrink-0 px-4 py-2 rounded-xl text-sm
                      bg-black text-white dark:bg-white dark:text-black
                      disabled:opacity-50
                    "
                  >
                    {downloadingId === purchase.resources?.id ? "Opening..." : "Download again"}
                  </button>
                </div>
              </div>
            ))}

            {purchases.length === 0 && (
              <p className="text-zinc-500">No downloaded resources yet.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {uploads.map((u) => {
              const statusStyles = {
                approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40",
                pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40",
                rejected: "bg-red-100 text-red-700 dark:bg-red-900/40",
              };

              return (
                <div
                  key={u.id}
                  className="
                    rounded-2xl p-4
                    border border-zinc-200 dark:border-zinc-800
                    bg-white dark:bg-zinc-900
                  "
                >
                  <div className="flex justify-between">
                    <p className="font-medium">{u.title}</p>

                    <div
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${statusStyles[u.status as keyof typeof statusStyles]}
                      `}
                    >
                      {u.status}
                    </div>
                  </div>

                  {u.status === "rejected" && u.rejected_reason && (
                    <p className="text-xs text-red-500 mt-2">Reason: {u.rejected_reason}</p>
                  )}
                </div>
              );
            })}

            {uploads.length === 0 && <p className="text-zinc-500">No uploads yet.</p>}
          </div>
        )}
      </div>


    </main>
  );
}
