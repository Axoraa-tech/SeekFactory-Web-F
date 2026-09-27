"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { getApi } from "@/shared/api";
import type { BuyerProfile } from "@/entities/user";
import type { Product } from "@/entities/product";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Category } from "@/entities/category";
import type { RfqItem } from "@/entities/rfq";
import type { FeedItem } from "@/shared/api/contracts";
import type { MembershipTier, ProfileFormData, ProfileTab } from "./profile-types";
import { ProfileHero } from "./profile-hero";
import { ProfileTabNav } from "./profile-tab-nav";
import { ProfileAside } from "./profile-aside";
import { ProfileDetailsPanel } from "./profile-details-panel";
import { ProfileRfqsPanel } from "./profile-rfqs-panel";
import { ProfileSavedPanel } from "./profile-saved-panel";
import { ProfileFollowingPanel } from "./profile-following-panel";
import { ProfileMembershipPanel } from "./profile-membership-panel";
import { useBuyerPlan } from "@/features/subscription";

type Props = {
  user: BuyerProfile;
  initialSavedProducts: Product[];
  initialSavedSeeks: FeedItem[];
  initialFollowing: Manufacturer[];
  initialRfqs: RfqItem[];
  categories: Category[];
};

const TABS: ProfileTab[] = ["details", "rfqs", "saved", "following", "premium"];

export function UserProfileDashboard({
  user,
  initialSavedProducts,
  initialSavedSeeks,
  initialFollowing,
  initialRfqs,
  categories,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tier, upgradeTier } = useBuyerPlan();
  const requestedTab = searchParams.get("tab") as ProfileTab | null;
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    requestedTab && TABS.includes(requestedTab) ? requestedTab : "details"
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user.name,
    email: user.email || "",
    companyName: user.companyName,
    industry: user.industry,
    country: user.country,
    phone: user.phone || "",
    taxId: user.taxId || "",
    address: user.address || "",
  });

  const [savedProducts, setSavedProducts] = useState(initialSavedProducts);
  const [savedSeeks, setSavedSeeks] = useState(initialSavedSeeks);
  const [followedSuppliers, setFollowedSuppliers] = useState(initialFollowing);
  const [rfqs, setRfqs] = useState(initialRfqs);

  const currentTier: MembershipTier = tier;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const errorText = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

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
        taxId: formData.taxId,
        address: formData.address,
      });
      showToast("Company profile & contact details saved");
      router.refresh();
    } catch (err) {
      showToast(errorText(err, "Could not save your profile. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSaved = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const previous = savedProducts;
    setSavedProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await getApi().products.toggleSave(productId);
      showToast("Product removed from saved");
    } catch (err) {
      setSavedProducts(previous);
      showToast(errorText(err, "Could not remove the product"));
    }
  };

  const handleRemoveSeek = async (reelId: string) => {
    const previous = savedSeeks;
    setSavedSeeks((prev) => prev.filter((item) => item.reel.id !== reelId));
    try {
      await getApi().feed.saveReel(reelId);
      showToast("Seek removed from saved");
    } catch (err) {
      setSavedSeeks(previous);
      showToast(errorText(err, "Could not remove the seek"));
    }
  };

  const handleToggleFollow = async (mId: string) => {
    const previous = followedSuppliers;
    setFollowedSuppliers((prev) => prev.filter((m) => m.id !== mId));
    try {
      await getApi().manufacturers.toggleFollow(mId);
      showToast("Manufacturer removed from following");
    } catch (err) {
      setFollowedSuppliers(previous);
      showToast(errorText(err, "Could not unfollow"));
    }
  };

  const handleUpgradeTier = async (next: MembershipTier) => {
    const result = await upgradeTier(next);
    if (!result.ok) {
      showToast(result.message);
      return;
    }
    showToast(
      next === "free" ? "Membership changed to the Free plan" : `Membership changed to the ${next === "pro" ? "Pro" : "Enterprise"} plan`
    );
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
  const savedCount = savedProducts.length + savedSeeks.length;

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
            savedCount={savedCount}
            followingCount={followedSuppliers.length}
            isLoggingOut={isLoggingOut}
            onOpenPremium={openPremium}
            onLogout={handleLogout}
          />

          <ProfileTabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            rfqCount={rfqs.length}
            savedCount={savedCount}
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

          {activeTab === "rfqs" && (
            <ProfileRfqsPanel
              user={user}
              rfqs={rfqs}
              categories={categories}
              focusRfqId={searchParams.get("rfq") ?? undefined}
              onChange={(updated) => setRfqs((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)))}
              onToast={showToast}
            />
          )}

          {activeTab === "saved" && (
            <ProfileSavedPanel
              savedProducts={savedProducts}
              savedSeeks={savedSeeks}
              onRemoveSaved={handleRemoveSaved}
              onRemoveSeek={handleRemoveSeek}
            />
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
