"use client";

import { Moon, Sun } from "lucide-react";

export const THEME_STORAGE_KEY = "raff-theme";

/**
 * Inline script (run before paint, see layout.tsx) that applies the saved or
 * system theme. Prevents a flash of the wrong theme on first load.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()`;

export default function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode) — theme still applies for this visit
    }
  }

  // Both icons are rendered and swapped with CSS, so server and client markup match.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="btn-secondary h-9 w-9 rounded-full p-0"
    >
      <Moon size={16} className="dark:hidden" />
      <Sun size={16} className="hidden dark:block" />
    </button>
  );
}
