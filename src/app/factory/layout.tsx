import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function FactoryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
        <Link href="/" aria-label="SeekFactory home">
          <BrandLogo className="h-10 w-auto max-w-[220px] object-contain object-left" />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/explore" className="text-ink-muted hover:text-ink">
            Explore
          </Link>
          <Link href="/profile" className="text-brand-blue">
            Profile
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  );
}
