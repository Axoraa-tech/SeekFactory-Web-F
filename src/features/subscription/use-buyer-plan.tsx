"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRegionalSettings, CURRENCIES } from "@/shared/i18n/regional-context";
import { getApi } from "@/shared/api";
import type { BuyerPlan } from "@/entities/plan";
import type { BuyerPlanTier } from "@/entities/user";
import { useTranslations } from "next-intl";

export type { BuyerPlanTier } from "@/entities/user";
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

const REGIONS: Record<SubscriptionRegion, Pick<SubscriptionPricing, "currencySymbol" | "currencyCode" | "regionName" | "flag">> = {
  india: { currencySymbol: "₹", currencyCode: "INR", regionName: "India", flag: "🇮🇳" },
  china: { currencySymbol: "¥", currencyCode: "CNY", regionName: "China", flag: "🇨🇳" },
};

const trim = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** Display strings for the region, from the backend plan prices ("—" until they load). */
function buildPricing(plans: BuyerPlan[], region: SubscriptionRegion): SubscriptionPricing {
  const meta = REGIONS[region];
  const price = (code: BuyerPlanTier) => {
    const plan = plans.find((p) => p.code === code);
    if (!plan) return null;
    return region === "india" ? plan.priceInr : plan.priceCny;
  };
  const pro = price("pro");
  const enterprise = price("enterprise");
  const free = price("free");
  const unknown = "—";
  if (region === "india") {
    return {
      ...meta,
      freePrice: free === null ? unknown : `₹${trim(free)}`,
      proPrice: pro === null ? unknown : `${trim(pro)} Rs`,
      proPriceFormatted: pro === null ? unknown : `₹${trim(pro)}`,
      proPriceSub: pro === null ? unknown : `${trim(pro)} Rs`,
      proPriceLabel: pro === null ? unknown : `₹${trim(pro)} (${trim(pro)} Rs) / month`,
      enterprisePrice: enterprise === null ? unknown : `₹${trim(enterprise)}`,
      enterprisePriceLabel: enterprise === null ? unknown : `₹${trim(enterprise)} (${trim(enterprise)} Rs) / month`,
    };
  }
  return {
    ...meta,
    freePrice: free === null ? unknown : `¥${trim(free)}`,
    proPrice: pro === null ? unknown : `${trim(pro)} Yuan`,
    proPriceFormatted: pro === null ? unknown : `${trim(pro)} Yuan`,
    proPriceSub: pro === null ? unknown : `¥${trim(pro)}`,
    proPriceLabel: pro === null ? unknown : `${trim(pro)} Yuan (¥${trim(pro)}) / month`,
    enterprisePrice: enterprise === null ? unknown : `${trim(enterprise)} Yuan`,
    enterprisePriceLabel: enterprise === null ? unknown : `${trim(enterprise)} Yuan (¥${trim(enterprise)}) / month`,
  };
}

/** "₹1 (1 Rs)" / "10 Yuan (¥10)" for a plan in a region, from backend prices; "—" until loaded. */
export function planPriceLabel(plans: BuyerPlan[], code: BuyerPlanTier, region: SubscriptionRegion): string {
  const plan = plans.find((p) => p.code === code);
  if (!plan) return "—";
  if (region === "india") return `₹${trim(plan.priceInr)} (${trim(plan.priceInr)} Rs)`;
  return `${trim(plan.priceCny)} Yuan (¥${trim(plan.priceCny)})`;
}

/** `redirected` means the buyer was sent on to sign in or pay, so callers should not show an error. */
type UpgradeResult = { ok: true } | { ok: false; message: string; redirected?: boolean };

interface BuyerPlanContextValue {
  tier: BuyerPlanTier;
  region: SubscriptionRegion;
  pricing: SubscriptionPricing;
  /** Plans as the backend defines them (name, prices, features). */
  plans: BuyerPlan[];
  /** False for guests; upgrading needs an account. */
  isSignedIn: boolean;
  isSupplierLocked: boolean;
  isUpgradeModalOpen: boolean;
  setRegion: (region: SubscriptionRegion) => void;
  /** Saves the plan on the account (no payment is collected yet). Guests are sent to sign in. */
  upgradeTier: (tier: BuyerPlanTier) => Promise<UpgradeResult>;
  /** Called by the shell with the signed-in user's plan (null for guests). Manufacturers are never locked. */
  syncPlan: (tier: BuyerPlanTier | null, isManufacturer?: boolean) => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
}

const BuyerPlanContext = createContext<BuyerPlanContextValue | null>(null);

/** The pricing region is a per-browser viewing preference; the plan itself lives on the account. */
const REGION_STORAGE_KEY = "seekfactory_subscription_region";

export function BuyerPlanProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const router = useRouter();
  const { selectedCurrency, setCurrency } = useRegionalSettings();
  const [tier, setTier] = useState<BuyerPlanTier>("free");
  const [signedIn, setSignedIn] = useState(false);
  const [isManufacturer, setIsManufacturer] = useState(false);
  const [plans, setPlans] = useState<BuyerPlan[]>([]);
  const [region, setRegionState] = useState<SubscriptionRegion>("india");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    getApi()
      .platform.listBuyerPlans()
      .then(setPlans)
      .catch(() => {
        // Prices show as "—" when plans cannot be loaded
      });
  }, []);

  useEffect(() => {
    try {
      const savedRegion = localStorage.getItem(REGION_STORAGE_KEY) as SubscriptionRegion | null;
      if (savedRegion === "india" || savedRegion === "china") {
        setRegionState(savedRegion);
      } else {
        setRegionState(selectedCurrency?.code === "CNY" ? "china" : "india");
      }
    } catch {
      // ignore
    }
  }, [selectedCurrency?.code]);

  const syncPlan = useCallback((next: BuyerPlanTier | null, manufacturer = false) => {
    setSignedIn(next !== null);
    setIsManufacturer(next !== null && manufacturer);
    setTier(next ?? "free");
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

  const upgradeTier = useCallback(async (newTier: BuyerPlanTier): Promise<UpgradeResult> => {
    if (!signedIn) {
      setIsUpgradeModalOpen(false);
      router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return { ok: false, message: t("plans.signInToChangeYour"), redirected: true };
    }
    // Paid plans are activated by an admin once a payment proof is approved, so every upgrade
    // button leads to the payment flow instead of switching the plan directly
    if (newTier !== "free") {
      setIsUpgradeModalOpen(true);
      return { ok: false, message: "", redirected: true };
    }
    try {
      const profile = await getApi().session.updatePlan(newTier);
      setTier(profile.plan ?? newTier);
      setIsUpgradeModalOpen(false);
      router.refresh();
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : t("plans.couldNotChangeYourPlan") };
    }
  }, [signedIn, router, t]);

  const openUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
  }, []);

  const pricing = useMemo(() => buildPricing(plans, region), [plans, region]);
  const isSupplierLocked = tier === "free" && !isManufacturer;

  return (
    <BuyerPlanContext.Provider
      value={{
        tier,
        region,
        pricing,
        plans,
        isSignedIn: signedIn,
        isSupplierLocked,
        isUpgradeModalOpen,
        setRegion,
        upgradeTier,
        syncPlan,
        openUpgradeModal,
        closeUpgradeModal,
      }}
    >
      {children}
    </BuyerPlanContext.Provider>
  );
}

export function useBuyerPlan(): BuyerPlanContextValue {
  const t = useTranslations();
  const context = useContext(BuyerPlanContext);
  if (!context) {
    return {
      tier: "free",
      region: "india",
      pricing: buildPricing([], "india"),
      plans: [],
      isSignedIn: false,
      isSupplierLocked: true,
      isUpgradeModalOpen: false,
      setRegion: () => {},
      upgradeTier: async () => ({ ok: false, message: t("plans.plansAreUnavailable") }),
      syncPlan: () => {},
      openUpgradeModal: () => {},
      closeUpgradeModal: () => {},
    };
  }
  return context;
}
