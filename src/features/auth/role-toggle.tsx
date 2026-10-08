"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { useTranslations } from "next-intl";

type Role = "buyer" | "manufacturer";

export function RoleToggle({ compact = false }: { compact?: boolean }) {
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role: Role = searchParams.get("role") === "manufacturer" ? "manufacturer" : "buyer";

  function hrefFor(next: Role) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", next);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className={cn("grid grid-cols-2 rounded-full border border-line", compact ? "mb-2.5 p-0.5" : "mb-5 p-1")}>
      <Link
        href={hrefFor("buyer")}
        className={cn(
          "rounded-full text-center font-semibold transition-colors",
          compact ? "py-1 text-xs" : "py-1.5 text-sm",
          role === "buyer" ? "bg-brand-orange text-white" : "text-ink-muted hover:text-ink",
        )}
      >
        {t("userMenu.plan.free")}
      </Link>
      <Link
        href={hrefFor("manufacturer")}
        className={cn(
          "rounded-full text-center font-semibold transition-colors",
          compact ? "py-1 text-xs" : "py-1.5 text-sm",
          role === "manufacturer" ? "bg-brand-orange text-white" : "text-ink-muted hover:text-ink",
        )}
      >
        {t("userMenu.manufacturer")}
      </Link>
    </div>
  );
}
