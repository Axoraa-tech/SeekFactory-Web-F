"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { getApi } from "@/shared/api";
import type { BuyerProfile } from "@/entities/user";
import type { Product } from "@/entities/product";
import type { Manufacturer } from "@/entities/manufacturer";
import type { MembershipTier, ProfileFormData, ProfileRfq, ProfileTab } from "./profile-types";
import { ProfileHero } from "./profile-hero";
import { ProfileTabNav } from "./profile-tab-nav";
import { ProfileDetailsPanel } from "./profile-details-panel";
import { ProfileRfqsPanel } from "./profile-rfqs-panel";
import { ProfileSavedPanel } from "./profile-saved-panel";
import { ProfileFollowingPanel } from "./profile-following-panel";
import { ProfileMembershipPanel } from "./profile-membership-panel";

type Props = {
  user: BuyerProfile;
  initialProducts?: Product[];
  initialManufacturers?: Manufacturer[];
};

export function UserProfileDashboard({
  user,
  initialProducts = [],
  initialManufacturers = [],
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("details");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user.name || "Global Sourcing Lead",
    email: (user as { email?: string }).email || "buyer@seekfactory.com",
    companyName: user.companyName || "Apex Industrial Solutions",
    industry: user.industry || "Precision Engineering & Machinery",
    country: user.country || "India",
    phone: "+91 98765 43210",
    taxId: "GSTIN29ABCDE1234F1Z5",
    address: "Plot 42, Peenya Industrial Area, Phase 2, Bengaluru, Karnataka 560058",
  });

  const [savedProducts, setSavedProducts] = useState<Product[]>(() => {
    return initialProducts.slice(0, 4);
  });

  const [followedSuppliers, setFollowedSuppliers] = useState<Manufacturer[]>(() => {
    return initialManufacturers.slice(0, 3);
  });

  const [currentTier, setCurrentTier] = useState<MembershipTier>("pro");

  const [rfqs] = useState<ProfileRfq[]>([
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
    {
      id: "SF-RFQ-8910",
      title: "Closed Die Forged Automotive Drive Shafts",
      category: "Forging & Casting",
      targetQty: "250 Pieces",
      targetPrice: "₹2,800 / pc",
      status: "In Tooling & Sample Run",
      statusColor: "text-blue-700 bg-blue-50 border-blue-200",
      date: "3 days ago",
    },
    {
      id: "SF-RFQ-7241",
      title: "Multi-Cavity Precision Injection Tooling Mold",
      category: "Molds & Tooling",
      targetQty: "1 Set",
      targetPrice: "₹1,80,000 / set",
      status: "Open for Verified Bids",
      statusColor: "text-amber-700 bg-amber-50 border-amber-200",
      date: "1 week ago",
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast("Company profile & contact preferences updated successfully!");
    }, 600);
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
    showToast(`Membership successfully upgraded to ${tier.toUpperCase()} Tier!`);
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

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <ProfileHero
        user={user}
        formData={formData}
        currentTier={currentTier}
        rfqCount={rfqs.length}
        savedCount={savedProducts.length}
        followingCount={followedSuppliers.length}
        isLoggingOut={isLoggingOut}
        onOpenPremium={() => setActiveTab("premium")}
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
  );
}
