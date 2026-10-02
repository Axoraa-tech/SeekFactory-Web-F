"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { getApi } from "@/shared/api";
import { resetFollowStore, setFollowed } from "@/features/engagement/follow-store";
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
import { useTranslations } from "next-intl";

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
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tier, upgradeTier } = useBuyerPlan();
  const requestedTab = searchParams.get("tab") as ProfileTab | null;
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    requestedTab && TABS.includes(requestedTab) ? requestedTab : "details"
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const toast = useToast();

  const errorText = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t("profile.dashboard.nameIsRequired"));
      return;
    }
    if (!formData.companyName.trim()) {
      toast.error(t("profile.dashboard.companyNameIsRequired"));
      return;
    }
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
      toast.success(t("profile.dashboard.companyProfileContactDetailsSaved"));
      router.refresh();
    } catch (err) {
      toast.error(errorText(err, t("profile.dashboard.couldNotSaveYourProfile")));
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
      toast.success(t("profile.dashboard.productRemovedFromSaved"));
    } catch (err) {
      setSavedProducts(previous);
      toast.error(errorText(err, t("profile.dashboard.couldNotRemoveTheProduct")));
    }
  };

  const handleRemoveSeek = async (reelId: string) => {
    const previous = savedSeeks;
    setSavedSeeks((prev) => prev.filter((item) => item.reel.id !== reelId));
    try {
      await getApi().feed.saveReel(reelId);
      toast.success(t("profile.dashboard.seekRemovedFromSaved"));
    } catch (err) {
      setSavedSeeks(previous);
      toast.error(errorText(err, t("profile.dashboard.couldNotRemoveTheSeek")));
    }
  };

  const handleToggleFollow = async (mId: string) => {
    const previous = followedSuppliers;
    setFollowedSuppliers((prev) => prev.filter((m) => m.id !== mId));
    try {
      const res = await getApi().manufacturers.toggleFollow(mId);
      setFollowed(mId, res.following);
      toast.success(t("profile.dashboard.manufacturerRemovedFromFollowing"));
    } catch (err) {
      setFollowedSuppliers(previous);
      toast.error(errorText(err, t("profile.dashboard.couldNotUnfollow")));
    }
  };

  const handleUpgradeTier = async (next: MembershipTier) => {
    const result = await upgradeTier(next);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(
      next === "free" ? t("profile.dashboard.membershipChangedToTheFree") : t("profile.dashboard.membershipChangedToThePlan", { next: next === "pro" ? t("profile.dashboard.pro") : t("profile.dashboard.enterprise") })
    );
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await getApi().session.logout();
      resetFollowStore();
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
              emailVerified={user.emailVerified}
            />
          )}

          {activeTab === "rfqs" && (
            <ProfileRfqsPanel
              user={user}
              rfqs={rfqs}
              categories={categories}
              focusRfqId={searchParams.get("rfq") ?? undefined}
              onChange={(updated) => setRfqs((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)))}
              onToast={toast.success}
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
