/**
 * Client-side mirrors of the credit rules in Postgres
 * (see supabase/migrations/*_052_credit_economy_v2.sql). The database is the
 * source of truth — these are only for showing numbers in the UI.
 */

/** Credits every new account starts with. */
export const STARTER_CREDITS = 10;
/** Default price of a file (moderators can override per file). */
export const DEFAULT_DOWNLOAD_COST = 2;
/** Paid to the uploader when a moderator approves their file. */
export const APPROVAL_REWARD = 2;
/** One-time bonus on a student's first approved upload. */
export const FIRST_UPLOAD_BONUS = 10;

/** Mirrors public.calculate_download_cost(): flat price per file, whatever its length. */
export function downloadCost() {
  return DEFAULT_DOWNLOAD_COST;
}

/** Mirrors public.calculate_uploader_share(cost): earned per download. */
export function uploaderShare(cost: number = DEFAULT_DOWNLOAD_COST) {
  return cost <= 0 ? 0 : Math.max(1, Math.floor(cost * 0.5));
}

export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
