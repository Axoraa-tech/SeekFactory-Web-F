import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f3f2ef]">
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">{children}</main>
      <footer className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-4 py-6 text-xs text-ink-muted">
        <Link href="/explore">About</Link>
        <Link href="/legal/terms">User Agreement</Link>
        <Link href="/legal/privacy">Privacy Policy</Link>
        <Link href="/legal/cookies">Cookie Policy</Link>
      </footer>
    </div>
  );
}
