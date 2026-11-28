"use client";

import { cn } from "@/shared/lib/cn";

/** Credit the free market-rates service asks for wherever its rates are shown. */
export function RatesCredit({ className }: { className?: string }) {
  return (
    <a
      href="https://www.exchangerate-api.com"
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-[9.5px] font-normal text-slate-400 hover:underline", className)}
    >
      Rates by ExchangeRate-API
    </a>
  );
}
