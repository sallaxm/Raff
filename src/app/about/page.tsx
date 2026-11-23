import type { Metadata } from "next";
import { Coins, ShieldCheck, Upload } from "lucide-react";

export const metadata: Metadata = { title: "About" };

const STEPS = [
  { icon: Upload, title: "Upload", text: "Share notes, labs, assignments and past papers." },
  { icon: ShieldCheck, title: "Get approved", text: "Moderators review every upload for quality and integrity." },
  { icon: Coins, title: "Earn & spend", text: "Approved uploads earn credits. Spend them to download, or top up in QAR." },
];

export default function AboutPage() {
  return (
    <main className="page-narrow">
      <section className="card-hero">
        <h1 className="h1">About Raff</h1>
        <p className="mt-3 prose-body">
          Raff is a student resource exchange for universities in Qatar: past papers, notes,
          labs and assignments, organised by college, major and course.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="card">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <Icon size={16} />
              </span>
              <span className="text-xs font-semibold muted">STEP {i + 1}</span>
            </div>
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm muted">{text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
