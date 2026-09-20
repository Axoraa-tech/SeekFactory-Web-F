"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { getApi } from "@/shared/api";
import type { BuyerProfile } from "@/entities/user";
import type { Product } from "@/entities/product";
import type { Manufacturer } from "@/entities/manufacturer";
import type { MembershipTier, ProfileFormData, ProfileRfq, ProfileTab } from "./profile-types";
import { ProfileHero } from "./profile-hero";
import { ProfileTabNav } from "./profile-tab-nav";
import { ProfileAside } from "./profile-aside";
import { ProfileDetailsPanel } from "./profile-details-panel";
import { ProfileRfqsPanel } from "./profile-rfqs-panel";
import { ProfileSavedPanel } from "./profile-saved-panel";
import { ProfileFollowingPanel } from "./profile-following-panel";
import { ProfileMembershipPanel } from "./profile-membership-panel";
import { useBuyerPlan } from "@/features/subscription";

import type { RfqItem } from "@/entities/rfq";

type Props = {
  user: BuyerProfile;
  initialProducts?: Product[];
  initialManufacturers?: Manufacturer[];
  initialRfqs?: RfqItem[];
};

export function UserProfileDashboard({
  user,
  initialProducts = [],
  initialManufacturers = [],
  initialRfqs = [],
}: Props) {
  const router = useRouter();
  const { pricing, upgradeTier } = useBuyerPlan();
  const [activeTab, setActiveTab] = useState<ProfileTab>("details");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user.name || "Global Sourcing Lead",
    email: user.email || "",
    companyName: user.companyName || "Apex Industrial Solutions",
    industry: user.industry || "Precision Engineering & Machinery",
    country: user.country || "India",
    phone: user.phone || "+91 98765 43210",
    taxId: "GSTIN29ABCDE1234F1Z5",
    address: "Peenya Industrial Area, Phase 2, Bengaluru, Karnataka",
  });

  // Sync state if user profile props update
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        companyName: user.companyName || prev.companyName,
        industry: user.industry || prev.industry,
        country: user.country || prev.country,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const [savedProducts, setSavedProducts] = useState<Product[]>(() => {
    return initialProducts.slice(0, 4);
  });

  const [followedSuppliers, setFollowedSuppliers] = useState<Manufacturer[]>(() => {
    return initialManufacturers.slice(0, 3);
  });

  const [currentTier, setCurrentTier] = useState<MembershipTier>("pro");

  const [rfqs] = useState<ProfileRfq[]>(() => {
    if (initialRfqs && initialRfqs.length > 0) {
      return initialRfqs.map((r) => ({
        id: r.referenceNumber || r.id,
        title: r.productName,
        category: r.details?.split("]")[0]?.replace("[", "") || "Industrial Component",
        targetQty: `${r.quantity} ${r.unit || "Pieces"}`,
        targetPrice: r.targetPrice && r.targetPrice !== "Negotiable" ? `${r.currency || "INR"} ${r.targetPrice}` : "Negotiable",
        status: r.status === "SUBMITTED" ? "Open for Verified Bids" : r.status,
        statusColor: r.status === "SUBMITTED" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-emerald-700 bg-emerald-50 border-emerald-200",
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recently",
      }));
    }

    return [
      {
        id: "SF-RFQ-9482",
        title: "5-Axis CNC Precision Aluminum Housings",
        category: "CNC Machining",
        targetQty: "500 Pieces",
        targetPrice: "₹1,450 / pc",
        status: "3 Factory Quotes Received",
        statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
        date: "Yesterday",
      },
    ];
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await getApi().session.updateProfile({
        name: formData.name,
        companyName: formData.companyName,
        industry: formData.industry,
        country: formData.country,
        phone: formData.phone,
      });
      showToast("Company profile & contact preferences updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast("Profile details updated locally.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSaved = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSavedProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast("Product removed from saved wishlist");
  };

  const handleToggleFollow = (mId: string) => {
    setFollowedSuppliers((prev) => prev.filter((m) => m.id !== mId));
    showToast("Manufacturer removed from following");
  };

  const handleUpgradeTier = (tier: MembershipTier) => {
    setCurrentTier(tier);
    upgradeTier(tier === "pro" ? "pro" : tier === "enterprise" ? "enterprise" : "free");
    if (tier === "pro") {
      showToast(`Membership successfully updated to PRO Tier (${pricing.proPriceFormatted} / ${pricing.proPriceSub})!`);
    } else if (tier === "enterprise") {
      showToast(`Membership successfully updated to ENTERPRISE Tier (${pricing.enterprisePrice})!`);
    } else {
      showToast("Membership updated to Free Tier.");
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await getApi().session.logout();
      router.push("/");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const openPremium = () => setActiveTab("premium");

  return (
    <div className="relative space-y-5">
      {/* Soft ambient wash so liquid glass can refract something beyond flat gray */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-10 h-[520px] -z-10 rounded-[2.5rem] opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 12% 18%, rgba(26,115,232,0.28), transparent 58%), radial-gradient(ellipse 50% 42% at 88% 8%, rgba(242,107,33,0.2), transparent 52%), radial-gradient(ellipse 55% 48% at 55% 55%, rgba(120,200,255,0.18), transparent 65%), linear-gradient(180deg, rgba(255,255,255,0.35), transparent 70%)",
        }}
      />

      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 rounded-full border border-white/60 bg-ink/95 text-white px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-glass backdrop-blur-md glass-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">
        <div className="space-y-4 min-w-0">
          <ProfileHero
            user={user}
            formData={formData}
            currentTier={currentTier}
            rfqCount={rfqs.length}
            savedCount={savedProducts.length}
            followingCount={followedSuppliers.length}
            isLoggingOut={isLoggingOut}
            onOpenPremium={openPremium}
            onLogout={handleLogout}
          />

          <ProfileTabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            rfqCount={rfqs.length}
            savedCount={savedProducts.length}
            followingCount={followedSuppliers.length}
          />

          {activeTab === "details" && (
            <ProfileDetailsPanel
              formData={formData}
              setFormData={setFormData}
              isSaving={isSaving}
              onSave={handleSaveProfile}
            />
          )}

          {activeTab === "rfqs" && <ProfileRfqsPanel rfqs={rfqs} />}

          {activeTab === "saved" && (
            <ProfileSavedPanel savedProducts={savedProducts} onRemoveSaved={handleRemoveSaved} />
          )}

          {activeTab === "following" && (
            <ProfileFollowingPanel
              followedSuppliers={followedSuppliers}
              onToggleFollow={handleToggleFollow}
            />
          )}

          {activeTab === "premium" && (
            <ProfileMembershipPanel currentTier={currentTier} onUpgradeTier={handleUpgradeTier} />
          )}
        </div>

        <ProfileAside onOpenPremium={openPremium} />
      </div>
    </div>
  );
}
