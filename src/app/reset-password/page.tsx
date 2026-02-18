"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function savePassword() {
    setMsg("");

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
          Opened from reset link? Enter your new password below.
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
          disabled={saving}
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
