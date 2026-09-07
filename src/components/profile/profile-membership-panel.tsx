"use client";

import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/shared/lib/cn";
import type { MembershipTier } from "./profile-types";

type Props = {
  currentTier: MembershipTier;
  onUpgradeTier: (tier: MembershipTier) => void;
};

export function ProfileMembershipPanel({ currentTier, onUpgradeTier }: Props) {
  return (
    <div className="space-y-5">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Choose Your Sourcing Tier</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Upgrade to unlock priority RFQ dispatch, live video audits, and dedicated enterprise engineering
          support.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card
          className={cn(
            "p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-2xs",
            currentTier === "free"
              ? "border-brand-blue ring-2 ring-brand-blue/20 bg-blue-50/20"
              : "border-slate-200/90 bg-white"
          )}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Standard Buyer</h3>
              {currentTier === "free" && (
                <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-bold text-brand-blue">
                  Active
                </span>
              )}
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">₹0</span>
              <span className="text-xs text-slate-500"> / forever</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Browse 500+ Verified
                Plants
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Up to 5 Active RFQs /
                Month
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Standard Trade Assurance
                Escrow
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={currentTier === "free"}
            onClick={() => onUpgradeTier("free")}
            className="w-full h-9 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {currentTier === "free" ? "Current Plan" : "Switch to Free"}
          </button>
        </Card>

        <Card
          className={cn(
            "p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-md relative",
            currentTier === "pro"
              ? "border-brand-blue ring-2 ring-brand-blue/30 bg-blue-50/30"
              : "border-slate-300 bg-white"
          )}
        >
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-xs">
            Most Popular
          </span>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Pro Sourcing Lead</h3>
              {currentTier === "pro" && (
                <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-bold text-white">
                  Active
                </span>
              )}
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">₹3,999</span>
              <span className="text-xs text-slate-500"> / month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />{" "}
                <strong>Unlimited</strong> Custom RFQs & Quotes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Priority RFQ Dispatch
                (&lt; 4h quotes)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Verified Buyer Gold Badge
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Dedicated Account Manager
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={currentTier === "pro"}
            onClick={() => onUpgradeTier("pro")}
            className="w-full h-10 rounded-xl bg-brand-blue text-xs font-bold text-white hover:bg-brand-blue-dark shadow-sm active:scale-95 disabled:opacity-60 transition-all"
          >
            {currentTier === "pro" ? "Current Plan Active" : "Upgrade to Pro"}
          </button>
        </Card>

        <Card
          className={cn(
            "p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-2xs",
            currentTier === "enterprise"
              ? "border-brand-blue ring-2 ring-brand-blue/30 bg-blue-50/20"
              : "border-slate-200/90 bg-white"
          )}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Enterprise VIP</h3>
              {currentTier === "enterprise" && (
                <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold">
                  Active
                </span>
              )}
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">₹11,999</span>
              <span className="text-xs text-slate-500"> / month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> All Pro Buyer Features
                Included
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Third-Party On-Site Plant
                Inspection
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
            className="w-full h-9 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-black active:scale-95 disabled:opacity-60 transition-all shadow-xs"
          >
            {currentTier === "enterprise" ? "Current Plan Active" : "Upgrade to Enterprise"}
          </button>
        </Card>
      </div>
    </div>
  );
}
