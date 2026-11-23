import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16 text-center">
      <div className="card-hero space-y-3">
        <p className="text-5xl font-semibold tracking-tight">404</p>
        <p className="muted">We couldn’t find that page.</p>
        <div className="flex justify-center gap-2 pt-2">
          <Link href="/" className="btn-primary">Go home</Link>
          <Link href="/browse" className="btn-secondary">Browse courses</Link>
        </div>
      </div>
    </main>
  );
}
