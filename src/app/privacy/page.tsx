import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main className="page-narrow">
      <section className="card space-y-4">
        <h1 className="h1">Privacy</h1>
        <div className="space-y-3 prose-body">
          <p>
            Raff uses your email to authenticate you. We store your account id, credits, and
            upload/download history to run the credit system.
          </p>
          <p>Uploaded files are stored in Supabase Storage. Moderators can view files for review.</p>
          <p>
            Credit purchases are processed by Tap Payments. Your card details go directly to Tap
            and are never sent to or stored by Raff. We keep a record of each purchase (amount,
            credits and status) for support and accounting.
          </p>
          <p>
            We don’t sell your personal data. If you want your account removed, contact us via the
            Feedback page.
          </p>
        </div>
      </section>
    </main>
  );
}
