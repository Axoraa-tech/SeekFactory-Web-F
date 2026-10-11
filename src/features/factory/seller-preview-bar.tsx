import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SupplierPlanSync } from "./supplier-plan-sync";

/** Replaces the buyer TopNav when a manufacturer previews a public page from the Seller Hub. */
export async function SellerPreviewBar() {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 shadow-nav backdrop-blur-md">
      <SupplierPlanSync />
      <div className="mx-auto flex h-14 sm:h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label={t("layout.topNav.seekfactoryHome")}>
          <BrandLogo className="h-8 sm:h-11 w-auto max-w-[130px] sm:max-w-[220px] object-contain object-left" />
        </Link>

        <p className="hidden md:flex min-w-0 items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200/60 shadow-2xs">
          <Eye className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span className="truncate">{t("seller.preview.buyerView")}</span>
        </p>

        <Link
          href="/factory"
          className="inline-flex h-9 sm:h-10 shrink-0 items-center gap-1.5 rounded-xl bg-brand-orange hover:bg-[#d85b17] px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_14px_0_rgba(242,107,33,0.35)] transition-all active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("seller.preview.backToSellerHub")}</span>
        </Link>
      </div>
    </header>
  );
}
