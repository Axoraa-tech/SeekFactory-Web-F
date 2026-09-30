import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Award,
  Truck,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  FileText,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ProductActionBar } from "@/components/ui/product-action-bar";
import { ProductGallery } from "@/components/ui/product-gallery";
import { TrackProductView } from "@/features/analytics/track-product-view";
import { getApi } from "@/shared/api";
import { formatPriceInr } from "@/shared/lib/format";
import { minimumOrderQuantity } from "@/shared/lib/quantity";
import type { Product } from "@/entities/product";
import { getLocale, getTranslations } from "next-intl/server";
import { localizeCategoryName } from "@/i18n/zh-terms";

type PriceBand = { label: string; priceInr: number; savingPercent: number };

/** Quantity bands from the factory's own price tiers; one band (the base price) when it set none. */
function priceBands(product: Product): PriceBand[] {
  const minQty = minimumOrderQuantity(product.moq);
  const unit = product.unit ? ` ${product.unit}` : "";
  const tiers = (product.priceTiers ?? []).filter((t) => t.minQty > minQty).sort((a, b) => a.minQty - b.minQty);
  const starts = [{ minQty, priceInr: product.priceInr }, ...tiers];
  return starts.map((band, i) => {
    const next = starts[i + 1];
    const label = next ? `${band.minQty} - ${next.minQty - 1}${unit}` : `${band.minQty}+${unit}`;
    const savingPercent =
      product.priceInr > 0 ? Math.round((100 * (product.priceInr - band.priceInr)) / product.priceInr) : 0;
    return { label, priceInr: band.priceInr, savingPercent };
  });
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const t = await getTranslations();
  const { slug } = await params;
  const detail = await getApi().products.getBySlug(slug);
  return {
    title: detail?.product.name ?? t("product.page.productDetails"),
    description: detail?.product.description,
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const t = await getTranslations();
  const locale = await getLocale();
  const { slug } = await params;
  const { order } = await searchParams;
  const api = getApi();
  const [detail, categories] = await Promise.all([api.products.getBySlug(slug), api.categories.list()]);
  if (!detail) notFound();
  const { product, manufacturer } = detail;

  const category = categories.find((c) => c.id === product.categoryId);
  const parentCategory = category?.parentId ? categories.find((c) => c.id === category.parentId) : undefined;
  const categoryHref = parentCategory
    ? `/explore?category=${parentCategory.slug}&sub=${category?.slug}`
    : `/explore?category=${category?.slug}`;
  const hasPrice = product.priceInr > 0;
  const bands = hasPrice ? priceBands(product) : [];

  return (
    <section className="space-y-6">
      <TrackProductView productId={product.id} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-brand-blue transition-colors">{t("nav.home")}</Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-brand-blue transition-colors">{t("common.products")}</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Image & Factory Trust */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-slate-200/90 shadow-2xs">
            <ProductGallery
              images={product.imageUrls?.length ? product.imageUrls : [product.imageUrl]}
              alt={product.name}
              badge={t("supplier.oemDirect")}
            />
          </Card>

          {/* Supplier Mini Profile Bar */}
          <Card className="p-4 border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between gap-3">
              <Link
                href={`/manufacturers/${manufacturer.slug}`}
                className="flex items-center gap-3 hover:opacity-90 transition min-w-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={manufacturer.logoUrl}
                  alt={manufacturer.name}
                  className="h-12 w-12 rounded-xl border border-slate-200 object-cover shrink-0 shadow-2xs"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-slate-900 truncate">{manufacturer.name}</p>
                    {manufacturer.verified && <VerifiedBadge className="h-4 w-4 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {[manufacturer.location, manufacturer.country].filter(Boolean).join(", ")}
                    {manufacturer.yearsEstablished > 0 ? ` • ${t("seek.trust.since", { year: manufacturer.yearsEstablished })}` : ""}
                  </p>
                </div>
              </Link>

              <Link
                href={`/manufacturers/${manufacturer.slug}`}
                className="btn btn-secondary shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>{t("product.page.visitFactory")}</span>
              </Link>
            </div>
          </Card>

          {/* Technical Specifications Sheet */}
          <Card className="p-5 border-slate-200/90 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-brand-blue" />
              <span>{t("product.page.technicalSpecifications")}</span>
            </h3>
            <dl className="divide-y divide-slate-100 text-xs sm:text-sm">
              {product.moq && (
                <div className="flex justify-between py-2">
                  <dt className="text-slate-500 font-medium">{t("product.page.minimumOrderQuantityMoq")}</dt>
                  <dd className="font-bold text-slate-900">{product.moq}</dd>
                </div>
              )}
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2">
                  <dt className="text-slate-500 font-medium">{key}</dt>
                  <dd className="font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
            {product.datasheetUrl && (
              <a
                href={product.datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 hover:border-brand-blue hover:text-brand-blue transition-colors"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-red-600" />
                  <span className="truncate">{product.datasheetName || t("product.page.technicalDatasheet")}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-brand-blue">
                  <Download className="h-3.5 w-3.5" /> {t("product.page.pdf")}
                </span>
              </a>
            )}
          </Card>
        </div>

        {/* Right Column: Title, Tiered Pricing, Actions, Guarantees */}
        <div className="space-y-4">
          <Card className="p-6 border-slate-200/90 shadow-2xs space-y-5">
            <div>
              <div className="flex items-center gap-2">
                {category && (
                  <>
                    <Link
                      href={categoryHref}
                      className="rounded-md bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue hover:bg-brand-blue/15"
                    >
                      {localizeCategoryName(category.name, locale)}
                    </Link>
                    <span className="text-xs text-slate-400">•</span>
                  </>
                )}
                {hasPrice ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {t("product.page.readyToOrder")}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-semibold">{t("product.actions.priceOnRequest")}</span>
                )}
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Tiered Bulk Quantity Pricing Table (the factory's own price breaks) */}
            {bands.length > 0 && (
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  {bands.length > 1 ? t("product.page.bulkWholesalePricing") : t("product.page.wholesalePrice")}
                </p>
                <div
                  className={
                    bands.length === 1 ? "grid grid-cols-1 gap-2 text-center" : `grid gap-2 text-center ${bands.length === 2 ? "grid-cols-2" : "grid-cols-3"}`
                  }
                >
                  {bands.slice(0, 3).map((band, index) => (
                    <div
                      key={band.label}
                      className={
                        index === 1
                          ? "rounded-xl bg-white p-2.5 border border-brand-blue/30 shadow-2xs"
                          : "rounded-xl bg-white p-2.5 border border-slate-200 shadow-2xs"
                      }
                    >
                      <p className="text-[11px] text-slate-500 font-medium">{band.label}</p>
                      <p
                        className={
                          index === 1
                            ? "mt-1 text-sm sm:text-base font-extrabold text-brand-blue"
                            : "mt-1 text-sm sm:text-base font-extrabold text-slate-900"
                        }
                      >
                        {formatPriceInr(band.priceInr)}
                      </p>
                      {band.savingPercent > 0 ? (
                        <p className="text-[10px] text-emerald-600 font-bold">{t("product.page.save")} {band.savingPercent}%</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-medium">{t("product.page.standard")}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prominent Commerce Action Bar (Price, Buy Now Red, Add to Cart Orange, Chat) */}
            <div className="pt-2">
              <ProductActionBar
                productId={product.id}
                priceInr={product.priceInr}
                unit={product.unit}
                moq={product.moq}
                productSlug={product.slug}
                productName={product.name}
                manufacturerSlug={manufacturer.slug}
                autoOpenOrder={order === "1"}
                size="lg"
                layout="vertical"
              />
            </div>

            {/* Secondary Request Quotation Link */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{t("product.page.needCustomSpecsOrCif")}</span>
              <Link
                href={`/rfq/new?product=${product.slug}`}
                className="font-bold text-brand-blue hover:underline"
              >
                {t("product.page.requestCustomRfq")}
              </Link>
            </div>
          </Card>

          {/* Trade Assurance & Buyer Guarantees */}
          <Card className="p-5 border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("product.page.buyerProtectionGuarantees")}
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">{t("product.page.tradeAssuranceCovered")}</p>
                  <p className="text-slate-500 mt-0.5">
                    {t("product.page.yourPaymentIsHeldIn")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 shrink-0 text-brand-blue mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">{t("product.page.onTimeShipmentGuarantee")}</p>
                  <p className="text-slate-500 mt-0.5">
                    {t("product.page.compensationPaidIfShippingDispatch")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">{t("product.page.preShipmentQualityInspection")}</p>
                  <p className="text-slate-500 mt-0.5">
                    {t("product.page.factoryProvidesProductionInspectionReport")}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
