import Image from "next/image";
import Link from "next/link";
import { AdminLogoutButton } from "./admin-logout-button";
import { AdminMobileNav, AdminPillNav } from "./admin-nav";

/**
 * Admin chrome: a sticky top bar with the logo, the pill nav and the account
 * actions, over the product's standard canvas. Server component — the
 * interactive pieces bring their own "use client".
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-canvas min-h-screen text-ink">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/55 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-4 px-4 md:h-24 md:px-8">
          <Link href="/admin/dashboard" className="flex shrink-0 items-center gap-3" aria-label="SeekFactory admin home">
            <Image
              src="/brand/seekfactory-logo.png"
              alt="SeekFactory"
              width={851}
              height={293}
              priority
              className="h-10 w-auto object-contain md:h-12"
            />
            <span className="hidden h-7 w-px bg-line sm:block" />
            <span className="t-eyebrow hidden sm:inline">Admin</span>
          </Link>

          {/* Pill nav — below lg the scrolling text nav takes over */}
          <div className="hidden lg:block">
            <AdminPillNav />
          </div>

          <AdminLogoutButton />
        </div>

        <div className="lg:hidden">
          <AdminMobileNav />
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-8 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
