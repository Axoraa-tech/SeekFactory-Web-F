"use client";

import React from "react";
import { Eye } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useBuyerPlan } from "@/features/subscription";
import { useTranslations } from "next-intl";

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
  badgeLabel,
  compact = false,
}: SupplierLockOverlayProps) {
  const t = useTranslations();
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
      title={t("seek.lock.clickToViewSupplierDetails")}
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
      <div className="absolute inset-0 z-20 flex items-center justify-center p-1.5 bg-slate-900/10 backdrop-blur-[1px] transition-all group-hover/lock:bg-orange-950/15">
        <div
          className={cn(
            "group/pill flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3 py-1 text-slate-800 shadow-md backdrop-blur-md transition-all duration-200",
            "group-hover/lock:scale-105 group-hover/lock:border-brand-orange group-hover/lock:text-brand-orange group-hover/lock:shadow-[0_4px_16px_rgba(242,107,33,0.3)]",
            "hover:!bg-brand-orange hover:!text-white hover:!border-brand-orange",
            compact ? "text-[10px] px-2.5 py-0.5" : "text-xs"
          )}
        >
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-white shrink-0 transition-all duration-200 group-hover/lock:scale-110 group-hover/pill:bg-white group-hover/pill:text-brand-orange shadow-2xs">
            <Eye className="h-2.5 w-2.5" />
          </div>
          <span className="font-extrabold tracking-tight truncate">{badgeLabel ?? t("seek.viewManufacturer")}</span>
        </div>
      </div>
    </div>
  );
}
