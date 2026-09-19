"use client";

import { CheckCircle2, Globe } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { MembershipTier } from "./profile-types";
import { useBuyerPlan } from "@/features/subscription";

function IndiaFlagIcon({ className = "h-3.5 w-5" }: { className?: string }) {
  return (
    <svg
      className={cn("shrink-0 rounded-xs shadow-2xs overflow-hidden", className)}
      viewBox="0 0 640 480"
      aria-hidden="true"
    >
      <path fill="#f93" d="M0 0h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <path fill="#128807" d="M0 320h640v160H0z" />
      <circle cx="320" cy="240" r="50" fill="none" stroke="#008" strokeWidth="8" />
      <circle cx="320" cy="240" r="8" fill="#008" />
    </svg>
  );
}

function ChinaFlagIcon({ className = "h-3.5 w-5" }: { className?: string }) {
  return (
    <svg
      className={cn("shrink-0 rounded-xs shadow-2xs overflow-hidden", className)}
      viewBox="0 0 640 480"
      aria-hidden="true"
    >
      <path fill="#de2910" d="M0 0h640v480H0z" />
      <polygon fill="#ffde00" points="120,60 138,115 196,115 149,149 167,204 120,170 73,204 91,149 44,115 102,115" />
      <polygon fill="#ffde00" points="240,40 244,58 262,54 248,65 256,82 242,72 230,84 234,66 220,56 238,58" />
      <polygon fill="#ffde00" points="280,80 286,96 304,90 292,102 302,118 286,110 276,122 278,104 262,96 280,96" />
      <polygon fill="#ffde00" points="280,160 286,176 304,170 292,182 302,198 286,190 276,202 278,184 262,176 280,176" />
      <polygon fill="#ffde00" points="240,200 244,218 262,214 248,225 256,242 242,232 230,244 234,226 220,216 238,218" />
    </svg>
  );
}

type Props = {
  currentTier: MembershipTier;
  onUpgradeTier: (tier: MembershipTier) => void;
};

export function ProfileMembershipPanel({ currentTier, onUpgradeTier }: Props) {
  const { region, setRegion, pricing } = useBuyerPlan();

  return (
    <div className="glass-fade-in w-full space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            Choose Your Sourcing Tier
          </h2>
          <p className="max-w-2xl text-sm text-ink-muted">
            Upgrade to unlock priority RFQ dispatch, live video audits, and dedicated enterprise
            engineering support.
          </p>
        </div>

        {/* Region Switcher Pills */}
        <div className="inline-flex items-center rounded-2xl bg-white p-1 border border-slate-200 shadow-xs shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setRegion("india")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
              region === "india"
                ? "bg-brand-blue text-white shadow-xs"
                : "text-ink-muted hover:text-ink hover:bg-slate-50"
            )}
          >
            <IndiaFlagIcon />
            <span>India</span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-extrabold tracking-tight",
                region === "india" ? "bg-white/20 text-white" : "bg-blue-50 text-brand-blue"
              )}
            >
              ₹1 (1 Rs)
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRegion("china")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
              region === "china"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-ink-muted hover:text-ink hover:bg-slate-50"
            )}
          >
            <ChinaFlagIcon />
            <span>China</span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-extrabold tracking-tight",
                region === "china" ? "bg-white/20 text-white" : "bg-rose-50 text-rose-700"
              )}
            >
              10 Yuan (¥10)
            </span>
          </button>
        </div>
      </header>

      <div className="grid w-full gap-4 pt-1 md:grid-cols-3 md:items-stretch">
        {/* Standard Free Buyer */}
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
              <span className="text-2xl font-black text-ink">{pricing.freePrice}</span>
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
            className="glass-liquid-item mt-auto w-full h-9 rounded-full text-xs font-bold text-ink disabled:opacity-60 cursor-pointer"
          >
            {currentTier === "free" ? "Current Plan" : "Switch to Free"}
          </button>
        </div>

        {/* Pro Sourcing Lead (Hero Tier) */}
        <div
          className={cn(
            "glass-panel-liquid relative flex h-full flex-col justify-between space-y-4 p-5 transition hover:-translate-y-0.5 shadow-md",
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
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-ink">{pricing.proPriceFormatted}</span>
              <span className="text-xs font-bold text-brand-blue">({pricing.proPriceSub})</span>
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
            className="mt-auto w-full h-10 rounded-full bg-brand-blue text-xs font-bold text-white hover:bg-brand-blue-dark shadow-sm active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
          >
            {currentTier === "pro"
              ? "Current Plan Active"
              : region === "india"
              ? "Upgrade to Pro • ₹1 (1 Rs)"
              : "Upgrade to Pro • 10 Yuan (¥10)"}
          </button>
        </div>

        {/* Enterprise VIP */}
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
              <span className="text-2xl font-black text-ink">{pricing.enterprisePrice}</span>
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
            className="mt-auto w-full h-9 rounded-full bg-ink text-xs font-bold text-white hover:bg-black active:scale-95 disabled:opacity-60 transition-all shadow-sm cursor-pointer"
          >
            {currentTier === "enterprise"
              ? "Current Plan Active"
              : region === "india"
              ? "Upgrade to Enterprise (₹10)"
              : "Upgrade to Enterprise (50 Yuan)"}
          </button>
        </div>
      </div>
    </div>
  );
}
