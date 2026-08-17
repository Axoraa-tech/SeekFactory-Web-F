import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f3f2ef]">
      <header className="px-6 py-5">
        <Link href="/" aria-label="SeekFactory home">
          <BrandLogo className="h-10 w-auto max-w-[220px] object-contain object-left" />
        </Link>
      </header>
      <main className="flex flex-1 justify-center px-4 pb-10 pt-4">{children}</main>
      <footer className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-4 py-6 text-xs text-ink-muted">
        <Link href="/explore">About</Link>
        <Link href="/legal/terms">User Agreement</Link>
        <Link href="/legal/privacy">Privacy Policy</Link>
        <Link href="/legal/cookies">Cookie Policy</Link>
      </footer>
    </div>
  );
}
