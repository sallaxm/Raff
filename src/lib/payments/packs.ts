/**
 * Credit packs sold for Qatari Riyal. Safe to import on client and server —
 * the server always re-reads the pack by id, so prices can't be tampered with.
 *
 * Tweak prices/credits here; nothing else needs to change.
 */
export type CreditPack = {
  id: string;
  name: string;
  credits: number;
  priceQar: number;
  tagline: string;
  highlight?: string;
};

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 25,
    priceQar: 10,
    tagline: "A few past papers before a quiz",
  },
  {
    id: "exam",
    name: "Exam season",
    credits: 70,
    priceQar: 25,
    tagline: "Enough for a full midterm week",
    highlight: "Most popular",
  },
  {
    id: "semester",
    name: "Semester",
    credits: 160,
    priceQar: 50,
    tagline: "Every course, all semester",
    highlight: "Best value",
  },
];

export function findPack(id: string | null | undefined) {
  return CREDIT_PACKS.find((p) => p.id === id) ?? null;
}
