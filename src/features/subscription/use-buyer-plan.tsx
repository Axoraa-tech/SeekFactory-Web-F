"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type BuyerPlanTier = "free" | "pro" | "enterprise";

interface BuyerPlanContextValue {
  tier: BuyerPlanTier;
  isSupplierLocked: boolean;
  isUpgradeModalOpen: boolean;
  setTier: (tier: BuyerPlanTier) => void;
  upgradeTier: (tier: BuyerPlanTier) => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
}

const BuyerPlanContext = createContext<BuyerPlanContextValue | null>(null);

const STORAGE_KEY = "seekfactory_buyer_tier";

export function BuyerPlanProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTierState] = useState<BuyerPlanTier>("free");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as BuyerPlanTier | null;
      if (saved === "free" || saved === "pro" || saved === "enterprise") {
        setTierState(saved);
      }
    } catch {
      // ignore localStorage security errors if any
    }
    setMounted(true);
  }, []);

  const setTier = useCallback((newTier: BuyerPlanTier) => {
    setTierState(newTier);
    try {
      localStorage.setItem(STORAGE_KEY, newTier);
    } catch {
      // ignore
    }
  }, []);

  const upgradeTier = useCallback((newTier: BuyerPlanTier) => {
    setTier(newTier);
    setIsUpgradeModalOpen(false);
  }, [setTier]);

  const openUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
  }, []);

  // While not mounted on client, default to "free" (locked) for consistent SSR
  const currentTier = mounted ? tier : "free";
  const isSupplierLocked = currentTier === "free";

  return (
    <BuyerPlanContext.Provider
      value={{
        tier: currentTier,
        isSupplierLocked,
        isUpgradeModalOpen,
        setTier,
        upgradeTier,
        openUpgradeModal,
        closeUpgradeModal,
      }}
    >
      {children}
    </BuyerPlanContext.Provider>
  );
}

export function useBuyerPlan(): BuyerPlanContextValue {
  const context = useContext(BuyerPlanContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    return {
      tier: "free",
      isSupplierLocked: true,
      isUpgradeModalOpen: false,
      setTier: () => {},
      upgradeTier: () => {},
      openUpgradeModal: () => {},
      closeUpgradeModal: () => {},
    };
  }
  return context;
}
