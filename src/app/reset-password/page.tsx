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
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void savePassword();
        }}
        className="card-hero space-y-4"
      >
        <div>
          <h1 className="h1">Set a new password</h1>
          <p className="mt-1 text-sm muted">Open this page from your reset email, then choose a new password.</p>
        </div>

        <input
          type="password"
          autoComplete="new-password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <input
          type="password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input"
        />

        <button type="submit" disabled={saving || !ready} className="btn-primary btn-lg w-full">
          {saving ? "Saving…" : "Update password"}
        </button>

        {msg && <p className="notice">{msg}</p>}
      </form>
    </main>
  );
}
