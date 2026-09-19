"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRegionalSettings, CURRENCIES } from "@/shared/i18n/regional-context";

export type BuyerPlanTier = "free" | "pro" | "enterprise";
export type SubscriptionRegion = "india" | "china";

export interface SubscriptionPricing {
  freePrice: string;
  proPrice: string;          // "1 Rs" or "10 Yuan"
  proPriceFormatted: string; // "₹1" or "10 Yuan"
  proPriceSub: string;       // "1 Rs" or "¥10"
  proPriceLabel: string;     // "₹1 (1 Rs) / month" or "10 Yuan (¥10) / month"
  enterprisePrice: string;   // "₹10" or "50 Yuan"
  enterprisePriceLabel: string; // "₹10 (10 Rs) / month" or "50 Yuan (¥50) / month"
  currencySymbol: string;    // "₹" or "¥"
  currencyCode: string;      // "INR" or "CNY"
  regionName: string;        // "India" or "China"
  flag: string;              // "🇮🇳" or "🇨🇳"
}

export const SUBSCRIPTION_PRICING: Record<SubscriptionRegion, SubscriptionPricing> = {
  india: {
    freePrice: "₹0",
    proPrice: "1 Rs",
    proPriceFormatted: "₹1",
    proPriceSub: "1 Rs",
    proPriceLabel: "₹1 (1 Rs) / month",
    enterprisePrice: "₹10",
    enterprisePriceLabel: "₹10 (10 Rs) / month",
    currencySymbol: "₹",
    currencyCode: "INR",
    regionName: "India",
    flag: "🇮🇳",
  },
  china: {
    freePrice: "¥0",
    proPrice: "10 Yuan",
    proPriceFormatted: "10 Yuan",
    proPriceSub: "¥10",
    proPriceLabel: "10 Yuan (¥10) / month",
    enterprisePrice: "50 Yuan",
    enterprisePriceLabel: "50 Yuan (¥50) / month",
    currencySymbol: "¥",
    currencyCode: "CNY",
    regionName: "China",
    flag: "🇨🇳",
  },
};

interface BuyerPlanContextValue {
  tier: BuyerPlanTier;
  region: SubscriptionRegion;
  pricing: SubscriptionPricing;
  isSupplierLocked: boolean;
  isUpgradeModalOpen: boolean;
  setTier: (tier: BuyerPlanTier) => void;
  setRegion: (region: SubscriptionRegion) => void;
  upgradeTier: (tier: BuyerPlanTier) => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
}

const BuyerPlanContext = createContext<BuyerPlanContextValue | null>(null);

const TIER_STORAGE_KEY = "seekfactory_buyer_tier";
const REGION_STORAGE_KEY = "seekfactory_subscription_region";

export function BuyerPlanProvider({ children }: { children: React.ReactNode }) {
  const { selectedCurrency, setCurrency } = useRegionalSettings();
  const [tier, setTierState] = useState<BuyerPlanTier>("free");
  const [region, setRegionState] = useState<SubscriptionRegion>("india");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage and regional settings on client mount
  useEffect(() => {
    try {
      const savedTier = localStorage.getItem(TIER_STORAGE_KEY) as BuyerPlanTier | null;
      if (savedTier === "free" || savedTier === "pro" || savedTier === "enterprise") {
        setTierState(savedTier);
      }

      const savedRegion = localStorage.getItem(REGION_STORAGE_KEY) as SubscriptionRegion | null;
      if (savedRegion === "india" || savedRegion === "china") {
        setRegionState(savedRegion);
      } else if (selectedCurrency?.code === "CNY") {
        setRegionState("china");
      } else {
        setRegionState("india");
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, [selectedCurrency?.code]);

  const setTier = useCallback((newTier: BuyerPlanTier) => {
    setTierState(newTier);
    try {
      localStorage.setItem(TIER_STORAGE_KEY, newTier);
    } catch {
      // ignore
    }
  }, []);

  const setRegion = useCallback((newRegion: SubscriptionRegion) => {
    setRegionState(newRegion);
    try {
      localStorage.setItem(REGION_STORAGE_KEY, newRegion);
    } catch {
      // ignore
    }
    // Synchronize global currency if matching option exists
    const targetCode = newRegion === "china" ? "CNY" : "INR";
    const found = CURRENCIES.find((c) => c.code === targetCode);
    if (found && setCurrency) {
      setCurrency(found);
    }
  }, [setCurrency]);

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

  const currentTier = mounted ? tier : "free";
  const currentRegion = mounted ? region : "india";
  const pricing = SUBSCRIPTION_PRICING[currentRegion];
  const isSupplierLocked = currentTier === "free";

  return (
    <BuyerPlanContext.Provider
      value={{
        tier: currentTier,
        region: currentRegion,
        pricing,
        isSupplierLocked,
        isUpgradeModalOpen,
        setTier,
        setRegion,
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
    return {
      tier: "free",
      region: "india",
      pricing: SUBSCRIPTION_PRICING.india,
      isSupplierLocked: true,
      isUpgradeModalOpen: false,
      setTier: () => {},
      setRegion: () => {},
      upgradeTier: () => {},
      openUpgradeModal: () => {},
      closeUpgradeModal: () => {},
    };
  }
  return context;
}
