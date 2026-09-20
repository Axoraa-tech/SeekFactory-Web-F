"use client";

import Link from "next/link";
import { Compass, Crown, FileText, ShieldCheck, Sparkles } from "lucide-react";

type Props = {
  onOpenPremium: () => void;
};

export function ProfileAside({ onOpenPremium }: Props) {
  return (
    <aside
      className="space-y-4 glass-fade-in xl:sticky xl:top-[88px]"
      style={{ animationDelay: "80ms" }}
    >
      <div className="glass-panel-liquid p-4 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-ink">Sourcing shortcuts</h2>
          <p className="text-[11px] text-ink-muted mt-0.5">
            Jump back into your SeekFactory workflow
          </p>
        </div>

        <div className="space-y-2">
          <Link
            href="/rfq/new"
            className="glass-liquid-item flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-ink hover:text-brand-blue"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue text-white shadow-sm">
              <FileText className="h-4 w-4" />
            </span>
            <span className="flex-1">Post a new RFQ</span>
          </Link>

          <Link
            href="/explore"
            className="glass-liquid-item flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-ink hover:text-brand-blue"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/50 text-brand-blue border border-white/60">
              <Compass className="h-4 w-4" />
            </span>
            <span className="flex-1">Explore verified plants</span>
          </Link>

          <button
            type="button"
            onClick={onOpenPremium}
            className="glass-liquid-item flex w-full items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-brand-orange"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
              <Crown className="h-4 w-4" />
            </span>
            <span className="flex-1 text-left">Upgrade membership</span>
          </button>
        </div>
      </div>

      <div className="glass-panel-liquid p-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/50 bg-white/25 text-emerald-600 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-ink flex items-center gap-1.5">
              Trade Assurance
              <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
            </h2>
            <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
              Escrow-backed payments, milestone releases, and dispute protection on every SeekFactory
              RFQ with verified OEM partners.
            </p>
          </div>
        </div>
        <div className="glass-liquid-item px-3 py-2 text-[11px] font-semibold text-emerald-700">
          Escrow protection is active on your account
        </div>
      </div>
    </aside>
  );
}
