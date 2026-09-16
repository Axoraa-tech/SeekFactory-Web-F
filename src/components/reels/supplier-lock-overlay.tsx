"use client";

import React from "react";
import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useBuyerPlan } from "@/features/subscription";

interface SupplierLockOverlayProps {
  children: React.ReactNode;
  className?: string;
  badgeLabel?: string;
  compact?: boolean;
}

/**
 * Wraps supplier details with frosted blur and a click-to-upgrade lock trigger
 * when the buyer is on the Free tier.
 */
export function SupplierLockOverlay({
  children,
  className,
  badgeLabel = "Supplier Details Locked",
  compact = false,
}: SupplierLockOverlayProps) {
  const { isSupplierLocked, openUpgradeModal } = useBuyerPlan();

  if (!isSupplierLocked) {
    return <>{children}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openUpgradeModal();
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group/lock relative overflow-hidden rounded-xl cursor-pointer transition-all",
        className
      )}
      title="Click to upgrade plan and unlock full supplier details"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openUpgradeModal();
        }
      }}
    >
      {/* Blurred Content Container */}
      <div className="filter blur-[6px] pointer-events-none select-none opacity-50 transition-all duration-300 group-hover/lock:opacity-40 group-hover/lock:blur-[7px]">
        {children}
      </div>

      {/* Frosted Glass Lock Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-1.5 bg-slate-900/10 backdrop-blur-[1px] transition-all group-hover/lock:bg-blue-900/15">
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3 py-1 text-slate-800 shadow-md backdrop-blur-md transition-all duration-200 group-hover/lock:scale-105 group-hover/lock:border-brand-blue/50 group-hover/lock:text-brand-blue group-hover/lock:shadow-lg",
            compact ? "text-[10px] px-2.5 py-0.5" : "text-xs"
          )}
        >
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shrink-0 group-hover/lock:bg-brand-blue transition-colors">
            <Lock className="h-2.5 w-2.5" />
          </div>
          <span className="font-extrabold tracking-tight truncate">{badgeLabel}</span>
          <span className="hidden sm:inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.2 text-[9px] font-bold text-blue-700">
            <Sparkles className="h-2.5 w-2.5 fill-blue-500 text-blue-500" />
            Upgrade
          </span>
        </div>
      </div>
    </div>
  );
}
