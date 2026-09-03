import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Award,
  Truck,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ProductActionBar } from "@/components/ui/product-action-bar";
import { getApi } from "@/shared/api";
import { formatPriceInr } from "@/shared/lib/format";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const detail = await getApi().products.getBySlug(slug);
  return {
    title: detail?.product.name ?? "Product Details",
    description: detail?.product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getApi().products.getBySlug(slug);
  if (!detail) notFound();
  const { product, manufacturer } = detail;

  // Calculate tiered bulk pricing
  const basePrice = product.priceInr;
  const tier1Price = basePrice;
  const tier2Price = Math.round(basePrice * 0.92);
  const tier3Price = Math.round(basePrice * 0.85);

  return (
    <section className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-brand-blue transition-colors">Products</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Image & Factory Trust */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-slate-200/90 shadow-2xs">
            <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <span className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
                OEM Direct
              </span>
            </div>
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
                    {manufacturer.location}, {manufacturer.country} • Est. {manufacturer.yearsEstablished}
                  </p>
                </div>
              </Link>

              <Link
                href={`/manufacturers/${manufacturer.slug}`}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-blue transition-colors"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Visit Factory</span>
              </Link>
            </div>
          </Card>

          {/* Technical Specifications Sheet */}
          <Card className="p-5 border-slate-200/90 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-brand-blue" />
              <span>Technical Specifications</span>
            </h3>
            <dl className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="flex justify-between py-2">
                <dt className="text-slate-500 font-medium">Minimum Order Quantity (MOQ)</dt>
                <dd className="font-bold text-slate-900">{product.moq} {product.unit}s</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500 font-medium">Delivery Lead Time</dt>
                <dd className="font-bold text-slate-900">15 - 25 Days</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500 font-medium">Customization</dt>
                <dd className="font-bold text-brand-blue">Custom Logo, Packaging & Graphics</dd>
              </div>
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2">
                  <dt className="text-slate-500 font-medium">{key}</dt>
                  <dd className="font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        {/* Right Column: Title, Tiered Pricing, Actions, Guarantees */}
        <div className="space-y-4">
          <Card className="p-6 border-slate-200/90 shadow-2xs space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                  Industrial Machinery
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Ready to Order
                </span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Tiered Bulk Quantity Pricing Table */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Bulk Wholesale Pricing
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white p-2.5 border border-slate-200 shadow-2xs">
                  <p className="text-[11px] text-slate-500 font-medium">{product.moq} - 9 {product.unit}s</p>
                  <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-900">
                    {formatPriceInr(tier1Price)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Standard</p>
                </div>

                <div className="rounded-xl bg-white p-2.5 border border-brand-blue/30 shadow-2xs relative">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-brand-blue px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                    Popular
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">10 - 49 {product.unit}s</p>
                  <p className="mt-1 text-sm sm:text-base font-extrabold text-brand-blue">
                    {formatPriceInr(tier2Price)}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold">Save 8%</p>
                </div>

                <div className="rounded-xl bg-white p-2.5 border border-slate-200 shadow-2xs">
                  <p className="text-[11px] text-slate-500 font-medium">50+ {product.unit}s</p>
                  <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-900">
                    {formatPriceInr(tier3Price)}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold">Save 15%</p>
                </div>
              </div>
            </div>

            {/* Prominent Commerce Action Bar (Price, Buy Now Red, Add to Cart Orange, Chat) */}
            <div className="pt-2">
              <ProductActionBar
                priceInr={product.priceInr}
                unit={product.unit}
                moq={product.moq}
                productSlug={product.slug}
                manufacturerSlug={manufacturer.slug}
                size="lg"
                layout="vertical"
              />
            </div>

            {/* Secondary Request Quotation Link */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Need custom specs or CIF shipping rates?</span>
              <Link
                href={`/rfq/new?product=${product.slug}`}
                className="font-bold text-brand-blue hover:underline"
              >
                Request Custom RFQ →
              </Link>
            </div>
          </Card>

          {/* Trade Assurance & Buyer Guarantees */}
          <Card className="p-5 border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Buyer Protection & Guarantees
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Trade Assurance Covered</p>
                  <p className="text-slate-500 mt-0.5">
                    Your payment is held in escrow until goods are delivered and confirmed to specification.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 shrink-0 text-brand-blue mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">On-Time Shipment Guarantee</p>
                  <p className="text-slate-500 mt-0.5">
                    Compensation paid if shipping dispatch exceeds agreed contractual lead times.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Pre-Shipment Quality Inspection</p>
                  <p className="text-slate-500 mt-0.5">
                    Factory provides production inspection report and high-resolution video run-tests prior to dispatch.
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
