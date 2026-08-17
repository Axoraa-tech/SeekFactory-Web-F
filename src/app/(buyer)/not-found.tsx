import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-card border border-line bg-surface p-8 text-center">
      <h1 className="text-xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-ink-muted">This factory or product is not in the mock catalog.</p>
      <Link href="/" className="mt-4 inline-block text-sm font-semibold text-brand-blue">
        Back to Reels
      </Link>
    </div>
  );
}
