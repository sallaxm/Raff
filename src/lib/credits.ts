/**
 * Client-side mirrors of the credit formulas in Postgres
 * (see supabase/migrations/*_039_credit_system.sql). The database is the
 * source of truth — these are only for showing estimates in the UI.
 */

const PAGES_PER_CREDIT = 5;
const MAX_DOWNLOAD_COST = 20;
const UPLOAD_REWARD_SHARE = 0.6;
export const FIRST_UPLOAD_BONUS = 3;

/** Mirrors public.calculate_download_cost(pages) */
export function downloadCost(pages: number | null | undefined) {
  const p = Math.max(pages ?? 0, 0);
  return Math.min(Math.max(Math.ceil(p / PAGES_PER_CREDIT), 1), MAX_DOWNLOAD_COST);
}

/** Mirrors public.calculate_upload_reward(cost) — before mod multipliers / bonus */
export function uploadReward(cost: number) {
  return Math.floor(Math.max(cost, 0) * UPLOAD_REWARD_SHARE);
}

export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
