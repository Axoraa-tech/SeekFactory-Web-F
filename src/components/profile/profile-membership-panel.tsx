"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { MembershipTier } from "./profile-types";

type Props = {
  currentTier: MembershipTier;
  onUpgradeTier: (tier: MembershipTier) => void;
};

export function ProfileMembershipPanel({ currentTier, onUpgradeTier }: Props) {
  return (
    <div className="glass-fade-in w-full space-y-6">
      <header className="space-y-1.5">
        <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          Choose Your Sourcing Tier
        </h2>
        <p className="max-w-2xl text-sm text-ink-muted">
          Upgrade to unlock priority RFQ dispatch, live video audits, and dedicated enterprise
          engineering support.
        </p>
      </header>

      <div className="grid w-full gap-4 pt-3 md:grid-cols-3 md:items-stretch">
        <div
          className={cn(
            "glass-panel-liquid flex h-full flex-col justify-between space-y-4 p-5 transition hover:-translate-y-0.5",
            currentTier === "free" && "ring-2 ring-brand-blue/25 border-brand-blue/30"
          )}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-ink text-base">Standard Buyer</h3>
              {currentTier === "free" && (
                <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-bold text-white">
                  Active
                </span>
              )}
            </div>
            <div>
              <span className="text-2xl font-black text-ink">₹0</span>
              <span className="text-xs text-ink-muted"> / forever</span>
            </div>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Browse 500+ Verified
                Plants
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Up to 5 Active RFQs /
                Month
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Standard Trade
                Assurance Escrow
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={currentTier === "free"}
            onClick={() => onUpgradeTier("free")}
            className="glass-liquid-item mt-auto w-full h-9 rounded-full text-xs font-bold text-ink disabled:opacity-60"
          >
            {currentTier === "free" ? "Current Plan" : "Switch to Free"}
          </button>
        </div>

        <div
          className={cn(
            "glass-panel-liquid relative flex h-full flex-col justify-between space-y-4 p-5 transition hover:-translate-y-0.5",
            currentTier === "pro" && "ring-2 ring-brand-blue/30 border-brand-blue/40"
          )}
        >
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-sm">
            Most Popular
          </span>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-ink text-base">Pro Sourcing Lead</h3>
              {currentTier === "pro" && (
                <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-bold text-white">
                  Active
                </span>
              )}
            </div>
            <div>
              <span className="text-2xl font-black text-ink">₹3,999</span>
              <span className="text-xs text-ink-muted"> / month</span>
            </div>
            <ul className="space-y-2 text-xs text-ink font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />{" "}
                <strong>Unlimited</strong> Custom RFQs & Quotes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Priority RFQ Dispatch
                (&lt; 4h quotes)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Verified Buyer Gold
                Badge
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Dedicated Account
                Manager
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={currentTier === "pro"}
            onClick={() => onUpgradeTier("pro")}
            className="mt-auto w-full h-10 rounded-full bg-brand-blue text-xs font-bold text-white hover:bg-brand-blue-dark shadow-sm active:scale-95 disabled:opacity-60 transition-all"
          >
            {currentTier === "pro" ? "Current Plan Active" : "Upgrade to Pro"}
          </button>
        </div>

        <div
          className={cn(
            "glass-panel-liquid flex h-full flex-col justify-between space-y-4 p-5 transition hover:-translate-y-0.5",
            currentTier === "enterprise" && "ring-2 ring-amber-400/40 border-amber-300/50"
          )}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-ink text-base">Enterprise VIP</h3>
              {currentTier === "enterprise" && (
                <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold">
                  Active
                </span>
              )}
            </div>
            <div>
              <span className="text-2xl font-black text-ink">₹11,999</span>
              <span className="text-xs text-ink-muted"> / month</span>
            </div>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> All Pro Buyer Features
                Included
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Third-Party On-Site
                Plant Inspection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Custom Escrow Milestone
                Contracts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> 24/7 Priority Sourcing
                Hotline
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={currentTier === "enterprise"}
            onClick={() => onUpgradeTier("enterprise")}
            className="mt-auto w-full h-9 rounded-full bg-ink text-xs font-bold text-white hover:bg-black active:scale-95 disabled:opacity-60 transition-all shadow-sm"
          >
            {currentTier === "enterprise" ? "Current Plan Active" : "Upgrade to Enterprise"}
          </button>
        </div>
      </div>
    </div>
  );
}
