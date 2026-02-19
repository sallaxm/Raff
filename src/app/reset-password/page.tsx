"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function prepareRecoverySession() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          if (!active) return;
          setMsg("This reset link is invalid or expired. Please request a new one.");
          setReady(false);
          return;
        }

        window.history.replaceState({}, "", "/reset-password");
      }

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const type = hash.get("type");

      if (accessToken && refreshToken && type === "recovery") {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          if (!active) return;
          setMsg("This reset link is invalid or expired. Please request a new one.");
          setReady(false);
          return;
        }

        window.history.replaceState({}, "", "/reset-password");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        setMsg("Open this page from your reset email link, or request a new reset link.");
        setReady(false);
        return;
      }

      setReady(true);
    }

    void prepareRecoverySession();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function savePassword() {
    setMsg("");

    if (!ready) {
      setMsg("Please open a valid reset link first.");
      return;
    }

    if (!password || !confirmPassword) {
      setMsg("Please fill both password fields.");
      return;
    }

    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSaving(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Password updated. You can now log in with your new password.");
  }

  return (
    <main className="max-w-md mx-auto p-8">
      <div
        className="
          rounded-3xl p-6
          bg-gradient-to-br from-blue-50 via-white to-pink-50
          dark:from-zinc-900 dark:to-zinc-800
          border border-zinc-200 dark:border-zinc-800
        "
      >
        <h1 className="text-3xl font-semibold">Set new password</h1>

        <p className="text-sm text-zinc-500 mt-1">
          Open this page from your reset email, then set a new password.
        </p>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          onClick={savePassword}
          disabled={saving || !ready}
          className="
            w-full mt-4 py-3 rounded-2xl
            bg-black text-white
            dark:bg-white dark:text-black
            font-medium
            hover:scale-[1.01] transition
            disabled:opacity-50
          "
        >
          {saving ? "Saving..." : "Update password"}
        </button>

        {msg && <p className="text-sm mt-4 text-zinc-500">{msg}</p>}
      </div>
    </main>
  );
}
