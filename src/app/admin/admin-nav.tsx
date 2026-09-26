"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Banknote, Building2, Clapperboard, FileText, LayoutDashboard, Settings, Users } from "lucide-react";
import { PendingBadge } from "@/features/admin/pending-approvals";

export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/manufacturers", label: "Manufacturers", icon: Building2 },
  { href: "/admin/rfqs", label: "RFQs Queue", icon: FileText },
  { href: "/admin/showcase", label: "Seek Showcase", icon: Clapperboard },
  { href: "/admin/pricing", label: "Pricing Config", icon: Banknote },
];

export const ADMIN_SETTINGS = { href: "/admin/settings", label: "Settings", icon: Settings };

/**
 * Floating pill navigation: the active destination shows as a filled chip with its
 * label, the rest collapse to icon-only circles. Each circle keeps an accessible
 * name and a hover tooltip, since an icon alone does not identify a destination.
 */
export function AdminPillNav() {
  const pathname = usePathname();
  const items = [...ADMIN_NAV, ADMIN_SETTINGS];

  return (
    <nav aria-label="Admin sections" className="flex items-center gap-0.5 rounded-full border border-white/70 bg-white/60 p-1 shadow-[0_6px_18px_-10px_rgba(15,43,92,0.5)] backdrop-blur-xl">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`group relative flex h-9 items-center justify-center rounded-full transition-all ${
              active
                ? "gap-2 bg-brand-blue px-3.5 text-white shadow-[0_6px_16px_-6px_rgba(26,115,232,0.9)]"
                : "w-9 text-ink-muted hover:bg-white hover:text-ink"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            {href === "/admin/manufacturers" && (
              <PendingBadge className="absolute -right-0.5 -top-0.5" />
            )}
            {active ? (
              <span className="whitespace-nowrap text-sm font-medium">{label}</span>
            ) : (
              <>
                <span className="sr-only">{label}</span>
                {/* Tooltip: an icon-only control must still say what it is on hover */}
                <span
                  role="presentation"
                  className="pointer-events-none absolute -bottom-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-white opacity-0 shadow-card transition-opacity group-hover:opacity-100"
                >
                  {label}
                </span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** Sidebar links; rendered client-side because icons are components and active state needs the pathname. */
export function AdminSidebarNav() {
  return (
    <>
      <nav className="flex-1 space-y-1">
        {ADMIN_NAV.map((item) => <AdminNavItem key={item.href} {...item} />)}
      </nav>
      <div className="pt-6 border-t border-slate-200">
        <AdminNavItem {...ADMIN_SETTINGS} />
      </div>
    </>
  );
}

function AdminNavItem({ href, label, icon: Icon }: (typeof ADMIN_NAV)[number]) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active ? "bg-orange-50 text-orange-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
    >
      <Icon size={20} className={active ? "text-orange-500" : "group-hover:text-orange-400 transition-colors"} />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}

/** Horizontal nav for small screens, where the sidebar is hidden. */
export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2">
      {[...ADMIN_NAV, ADMIN_SETTINGS].map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${active ? "bg-orange-50 font-medium text-orange-700" : "text-slate-600"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
