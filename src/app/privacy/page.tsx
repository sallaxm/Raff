import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What data Raff stores, why, and how to have it removed.",
};


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="h2">{title}</h2>
      <div className="mt-2 space-y-2 prose-body">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="page-narrow">
      <div className="card">
        <h1 className="h1">Privacy</h1>
        <p className="mt-3 prose-body">
          This page explains, in plain language, what Raff stores about you and why. We only keep
          what’s needed to run accounts, moderation and the credit system.
        </p>

        <Section title="What we store">
          <ul className="space-y-1">
            <li>
              • <strong>Account:</strong> your email address and an account ID. Passwords are
              handled by our authentication provider and stored only in hashed form — we never see
              them.
            </li>
            <li>
              • <strong>Profile:</strong> your credit balance and role (for example, student or
              moderator).
            </li>
            <li>
              • <strong>Uploads:</strong> the files you upload and their details (title, course,
              type, file name, size and page count), plus moderation status.
            </li>
            <li>
              • <strong>Activity:</strong> which resources you’ve downloaded and a log of every
              credit you’ve earned or spent.
            </li>
          </ul>
        </Section>

        <Section title="How it’s used">
          <p>
            To sign you in, stop you paying twice for the same download, calculate credits, enforce
            daily upload limits, and let moderators review uploads and act on rule-breaking
            accounts. We don’t use your data for advertising and we don’t sell it.
          </p>
        </Section>

        <Section title="Who can see what">
          <ul className="space-y-1">
            <li>• Other students see approved resources, not who you are or what you’ve downloaded.</li>
            <li>• Moderators can view pending uploads, uploader accounts and credit history to review content and investigate abuse.</li>
            <li>• Files are stored privately and are only served through short-lived download links.</li>
          </ul>
        </Section>

        <Section title="Payments">
          <p>
            If you buy credits, the payment is handled by Tap Payments. Your card details go
            straight to Tap and are never sent to or stored by Raff. We keep a record of each
            purchase (amount, credits and status) for support and accounting.
          </p>
        </Section>

        <Section title="Where it’s stored">
          <p>
            Accounts, the database and files are hosted with Supabase, and the website itself runs
            on a third-party hosting provider. Both process data on our behalf only.
          </p>
        </Section>

        <Section title="Cookies and local storage">
          <p>
            We use essential cookies to keep you signed in, and your browser’s local storage to
            remember your light/dark theme. There are no tracking or advertising cookies.
          </p>
        </Section>

        <Section title="Your choices">
          <p>
            You can ask us to correct your data, send you a copy of it, or delete your account.
            Deleting your account removes your profile and history; resources you uploaded may be
            removed or kept anonymously, depending on what you ask for. Use the{" "}
            <Link href="/feedback" className="underline underline-offset-4">
              Feedback
            </Link>{" "}
            page and choose “Account / data request”.
          </p>
        </Section>

        <Section title="Changes">
          <p>If we change how we handle data, we’ll update this page.</p>
        </Section>
      </div>
    </main>
  );
}
