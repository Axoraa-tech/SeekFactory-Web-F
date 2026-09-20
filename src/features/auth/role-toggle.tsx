"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/cn";

type Role = "buyer" | "manufacturer";

export function RoleToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role: Role = searchParams.get("role") === "manufacturer" ? "manufacturer" : "buyer";

  function hrefFor(next: Role) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", next);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="mb-5 grid grid-cols-2 rounded-full border border-line p-1">
      <Link
        href={hrefFor("buyer")}
        className={cn(
          "rounded-full py-1.5 text-center text-sm font-semibold",
          role === "buyer" ? "bg-brand-blue text-white" : "text-ink-muted",
        )}
      >
        Buyer
      </Link>
      <Link
        href={hrefFor("manufacturer")}
        className={cn(
          "rounded-full py-1.5 text-center text-sm font-semibold",
          role === "manufacturer" ? "bg-brand-blue text-white" : "text-ink-muted",
        )}
      >
        Manufacturer
      </Link>
    </div>
  );
}
