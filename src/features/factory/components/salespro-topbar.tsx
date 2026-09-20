import { Share2, Plus, Video, Eye, Globe2, ExternalLink, Menu } from "lucide-react";
import Link from "next/link";
import type { SellerTab, SellerFactoryProfile } from "../types";

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
  const titles: Record<SellerTab, string> = {
    overview: "Manufacturer Hub Dashboard",
    products: "Machinery Product Catalog",
    seeks: "Video Seeks (Short Reels)",
    rfqs: "India Buyer RFQs & Inquiries",
    messages: "Trade Messenger",
    profile: "Factory Verification & Profile",
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E8EB]">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl border border-[#E6E8EB] bg-white text-[#5F6368] hover:text-[#1A73E8] hover:bg-[#F3F4F6] transition shadow-2xs"
            aria-label="Open sidebar navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1C1C] tracking-tight">
            {titles[activeTab]}
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            India–China Industrial Machinery Discovery & Inquiries
          </p>
        </div>
      </div>

      {/* Right Actions Bar (Pure Blue, Orangish-Yellow, Red - No Black) */}
      <div className="flex flex-wrap items-center gap-2.5">
        <a
          href={profile.websiteUrl || `https://www.${profile.slug}.com`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-[#1A73E8]/30 bg-[#E8F1FD] px-3.5 py-2 text-xs font-semibold text-[#1A73E8] hover:bg-[#1A73E8] hover:text-white transition shadow-2xs group"
          title="Open official company website in new tab"
        >
          <Globe2 className="h-3.5 w-3.5" />
          <span>Seller Website</span>
          <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100" />
        </a>

        <Link
          href={`/manufacturers/${profile.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 rounded-lg border border-[#E6E8EB] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C1C1C] hover:bg-[#F3F4F6] hover:text-[#1A73E8] transition shadow-2xs"
        >
          <Eye className="h-3.5 w-3.5 text-[#5F6368]" />
          <span>Public Profile</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              alert("Factory profile link copied!");
            }
          }}
          className="flex items-center gap-1.5 rounded-lg border border-[#E6E8EB] bg-white px-3 py-2 text-xs font-semibold text-[#5F6368] hover:bg-[#F3F4F6] hover:text-[#1C1C1C] transition shadow-2xs"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share</span>
        </button>

        {/* Primary Action Button (Brand Blue #1A73E8) */}
        <button
          type="button"
          onClick={onOpenAddProduct}
          className="flex items-center gap-1.5 rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Post Product</span>
        </button>

        {/* Secondary Action Button (Buyer "Order Now" Orangish-Yellow #F26B21) */}
        <button
          type="button"
          onClick={onOpenAddSeek}
          className="flex items-center gap-1.5 rounded-lg bg-[#F26B21] hover:bg-[#E05307] text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Video className="h-4 w-4" />
          <span>Upload Seek</span>
        </button>
      </div>
    </div>
  );
}
