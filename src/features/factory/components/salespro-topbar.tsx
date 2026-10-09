import { useState } from "react";
import { LanguageCurrencyDropdown } from "@/components/layout/language-currency-dropdown";
import { Share2, Plus, Video, Eye, Globe2, ExternalLink, Menu, Check } from "lucide-react";
import Link from "next/link";
import type { SellerTab, SellerFactoryProfile } from "../types";
import { useTranslations } from "next-intl";

type Props = {
  activeTab: SellerTab;
  onOpenAddProduct: () => void;
  onOpenAddSeek: () => void;
  profile: SellerFactoryProfile;
  onOpenMobileMenu?: () => void;
};

export function SalesproTopbar({
  activeTab,
  onOpenAddProduct,
  onOpenAddSeek,
  profile,
  onOpenMobileMenu,
}: Props) {
  const t = useTranslations();
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle");

  /** Shares the public factory page (never the private /factory dashboard URL). */
  async function handleShare() {
    if (!profile.slug) return;
    const url = `${window.location.origin}/manufacturers/${profile.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: profile.name, text: `${profile.name} on SeekFactory`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareState("copied");
    } catch (err) {
      // The user closing the native share sheet is not an error
      if (err instanceof DOMException && err.name === "AbortError") return;
      setShareState("failed");
    }
    setTimeout(() => setShareState("idle"), 2500);
  }

  const titles: Record<SellerTab, string> = {
    overview: t("seller.top.manufacturerHubDashboard"),
    products: t("seller.top.machineryProductCatalog"),
    seeks: t("seller.top.videoSeeksShortReels"),
    rfqs: t("seller.top.indiaBuyerRfqsInquiries"),
    orders: t("seller.top.buyerOrderRequests"),
    messages: t("seller.nav.tradeMessenger"),
    profile: t("seller.nav.factorySettings"),
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E8EB]">
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl border border-[#E6E8EB] bg-white text-[#5F6368] hover:text-[#1A73E8] hover:bg-[#F3F4F6] transition shadow-2xs"
            aria-label={t("seller.top.openSidebarNavigation")}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl leading-tight font-extrabold text-[#1C1C1C] tracking-tight">
            {titles[activeTab]}
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            {t("seller.top.indiaChinaIndustrialMachineryDiscovery")}
          </p>
        </div>
        {/* On phones the language picker sits beside the title instead of taking a grid cell */}
        <div className="shrink-0 sm:hidden">
          <LanguageCurrencyDropdown align="right" />
        </div>
      </div>

      {/* Right Actions Bar (Pure Blue, Orangish-Yellow, Red - No Black) */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5 [&>*]:justify-center">
        {profile.websiteUrl && (
          <a
            href={profile.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 sm:col-auto flex items-center gap-1.5 rounded-lg border border-[#1A73E8]/30 bg-[#E8F1FD] px-3.5 py-2 text-xs font-semibold text-[#1A73E8] hover:bg-[#1A73E8] hover:text-white transition shadow-2xs group"
            title={t("seller.top.openOfficialCompanyWebsiteIn")}
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span>{t("seller.top.sellerWebsite")}</span>
            <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100" />
          </a>
        )}

        <div className="hidden sm:block">
          <LanguageCurrencyDropdown align="right" />
        </div>

        <Link
          href={`/manufacturers/${profile.slug}`}
          className="flex items-center gap-1.5 rounded-lg border border-[#E6E8EB] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C1C1C] hover:bg-[#F3F4F6] hover:text-[#1A73E8] transition shadow-2xs"
        >
          <Eye className="h-3.5 w-3.5 text-[#5F6368]" />
          <span>{t("seller.top.publicProfile")}</span>
        </Link>

        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={!profile.slug}
          title={
            profile.verified
              ? t("seller.top.shareYourPublicFactoryProfile")
              : t("seller.top.sharesYourPublicProfileLink")
          }
          className="flex items-center gap-1.5 rounded-lg border border-[#E6E8EB] bg-white px-3 py-2 text-xs font-semibold text-[#5F6368] hover:bg-[#F3F4F6] hover:text-[#1C1C1C] transition shadow-2xs disabled:opacity-50"
        >
          {shareState === "copied" ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Share2 className="h-3.5 w-3.5" />
          )}
          <span aria-live="polite">
            {shareState === "copied" ? t("seller.top.linkCopied") : shareState === "failed" ? t("seller.top.copyFailed") : t("common.share")}
          </span>
        </button>

        {/* Primary Action Button (Brand Blue #1A73E8) */}
        <button
          type="button"
          onClick={onOpenAddProduct}
          className="order-first sm:order-none flex items-center gap-1.5 rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("seller.postProduct")}</span>
        </button>

        {/* Secondary Action Button (Buyer "Order Now" Orangish-Yellow #F26B21) */}
        <button
          type="button"
          onClick={onOpenAddSeek}
          className="order-first sm:order-none flex items-center gap-1.5 rounded-lg bg-[#F26B21] hover:bg-[#E05307] text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Video className="h-4 w-4" />
          <span>{t("seller.uploadSeek")}</span>
        </button>
      </div>
    </div>
  );
}
