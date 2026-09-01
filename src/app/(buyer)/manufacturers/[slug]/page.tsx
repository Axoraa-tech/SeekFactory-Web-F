import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { getApi } from "@/shared/api";
import { formatCount, formatPriceInr } from "@/shared/lib/format";
import {
  MapPin,
  Calendar,
  Users,
  Maximize2,
  Globe2,
  ShieldCheck,
  Send,
  MessageSquare,
  Package,
  Video,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  UserCheck,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const detail = await getApi().manufacturers.getBySlug(slug);
  return {
    title: detail?.manufacturer.name ? `${detail.manufacturer.name} — Verified Manufacturer` : "Manufacturer",
    description: detail?.manufacturer.description,
  };
}

export default async function ManufacturerPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getApi().manufacturers.getBySlug(slug);
  if (!detail) notFound();
  const { manufacturer, products, reels } = detail;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Hero Factory Header & About Section */}
      <Card className="overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-xs">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-60 md:h-64 w-full overflow-hidden bg-neutral-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={manufacturer.coverUrl}
            alt={manufacturer.name}
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Verified OEM Factory</span>
            </span>

            {manufacturer.premium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold text-white shadow-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Premium Supplier</span>
              </span>
            )}
          </div>
        </div>

        {/* Profile Info & About Details */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              {/* Logo */}
              <div className="relative -mt-16 sm:-mt-20 h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={manufacturer.logoUrl}
                  alt={manufacturer.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-ink leading-tight flex items-center gap-2 flex-wrap">
                  <span>{manufacturer.name}</span>
                  {manufacturer.verified && <VerifiedBadge className="h-6 w-6" />}
                </h1>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{manufacturer.location || manufacturer.country}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Est. {manufacturer.yearsEstablished}</span>
                  </span>
                  <span>•</span>
                  <span>{formatCount(manufacturer.followerCount || 12840)} Followers</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Contact Supplier (Black) & Send RFQ (Orange) */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap pt-2 sm:pt-0">
              <Link
                href="/messages"
                className="flex-1 sm:flex-initial inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-black px-4 text-xs sm:text-sm font-bold text-white transition active:scale-95 shadow-xs"
              >
                <MessageSquare className="h-4 w-4 text-neutral-300" />
                <span>Contact Supplier</span>
              </Link>
              <Link
                href="/rfq/new"
                className="flex-1 sm:flex-initial inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-orange hover:bg-orange-600 px-5 text-xs sm:text-sm font-bold text-white transition active:scale-95 shadow-md"
              >
                <Send className="h-4 w-4" />
                <span>Send RFQ</span>
              </Link>
            </div>
          </div>

          {/* About the Factory & Description */}
          <div className="pt-3 border-t border-neutral-100 space-y-3">
            <div>
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                About the Manufacturer
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-4xl">
                {manufacturer.description}
              </p>
            </div>

            {/* Credentials / Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              {manufacturer.chairmanName && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-neutral-800 font-medium">
                  <UserCheck className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Chairman: <strong className="text-ink">{manufacturer.chairmanName}</strong></span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-emerald-800 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>ISO 9001:2015 Audited</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-neutral-800 font-medium">
                <Globe2 className="h-3.5 w-3.5 text-brand-orange" />
                <span>Export: {manufacturer.exportCountries.join(", ")}</span>
              </span>
            </div>
          </div>

          {/* Trade Assurance Guarantee Banner (Light background with Black/Orange CTA) */}
          <div className="rounded-2xl border border-neutral-200/90 bg-[#F9FAFB] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-brand-orange flex-shrink-0 shadow-xs">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-ink flex items-center gap-1.5">
                  <span>SeekFactory Trade Assurance</span>
                  <span className="rounded-full bg-orange-100 px-2 py-0.2 text-[10px] font-bold text-brand-orange">
                    Verified Protected
                  </span>
                </p>
                <p className="text-[11px] sm:text-xs text-neutral-600 mt-0.5">
                  Orders from this verified factory include pre-shipment quality inspection, milestone escrow, and transit protection.
                </p>
              </div>
            </div>

            <Link
              href="/rfq/new"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold px-4 shadow-xs transition active:scale-95 flex-shrink-0"
            >
              <span>Custom Quote</span>
              <ArrowRight className="h-3.5 w-3.5 text-brand-orange" />
            </Link>
          </div>
        </div>
      </Card>

      {/* 2. Key Factory Credentials Metrics (4-Column Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 bg-white flex items-center gap-3 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 flex-shrink-0">
            <Maximize2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Factory Area</p>
            <p className="text-xs sm:text-sm font-bold text-ink truncate mt-0.5">{manufacturer.factorySize}</p>
          </div>
        </Card>

        <Card className="p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 bg-white flex items-center gap-3 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Staff</p>
            <p className="text-xs sm:text-sm font-bold text-ink truncate mt-0.5">{manufacturer.employees} Staff</p>
          </div>
        </Card>

        <Card className="p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 bg-white flex items-center gap-3 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-brand-orange flex-shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Experience</p>
            <p className="text-xs sm:text-sm font-bold text-ink truncate mt-0.5">{new Date().getFullYear() - manufacturer.yearsEstablished}+ Years</p>
          </div>
        </Card>

        <Card className="p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 bg-white flex items-center gap-3 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 flex-shrink-0">
            <Globe2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Main Markets</p>
            <p className="text-xs sm:text-sm font-bold text-ink truncate mt-0.5">{manufacturer.exportCountries.slice(0, 2).join(", ")}</p>
          </div>
        </Card>
      </div>

      {/* 3. Modern E-Commerce Products Catalog Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-orange" />
            <span>Factory Products Catalog</span>
            <span className="rounded-full bg-orange-50 border border-orange-200/70 px-2.5 py-0.5 text-xs font-bold text-brand-orange">
              {products.length} Items
            </span>
          </h2>
          <span className="text-xs text-neutral-500">Wholesale Direct OEM Pricing</span>
        </div>

        {/* 4-Column E-Commerce Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group flex flex-col h-full">
              <Card className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white hover:border-brand-orange/50 hover:shadow-lg transition-all flex flex-col h-full group-hover:-translate-y-0.5 duration-200">
                {/* Product Thumbnail (E-Commerce Ratio with Tag) */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 rounded-md bg-neutral-900/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>In Stock</span>
                  </div>
                </div>

                {/* Product Details (Compact E-Commerce Layout) */}
                <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
                  <div className="space-y-1">
                    <p className="font-bold text-xs sm:text-sm text-neutral-900 group-hover:text-brand-orange transition line-clamp-2 leading-snug">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      MOQ: <span className="text-neutral-700 font-semibold">{product.moq}</span>
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1">
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-neutral-900">
                        {formatPriceInr(product.priceInr)}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-medium -mt-0.5">per {product.unit}</p>
                    </div>

                    <span className="inline-flex h-7 items-center rounded-lg bg-orange-50 group-hover:bg-brand-orange text-brand-orange group-hover:text-white px-2.5 text-[11px] font-bold transition-all shadow-2xs">
                      Inquire →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Live Machine Video Demonstrations (Reels) */}
      {reels.length > 0 && (
        <div className="space-y-4 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
            <Video className="h-5 w-5 text-neutral-900" />
            <span>Factory Machinery in Action</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reels.map((reel) => (
              <Card key={reel.id} className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-black text-white shadow-xs group">
                <div className="relative aspect-video w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={reel.posterUrl}
                    alt={reel.title}
                    className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs sm:text-sm font-bold text-white line-clamp-1">{reel.title}</p>
                    <p className="text-[11px] text-neutral-300 mt-0.5">{formatCount(reel.views)} views • {reel.likes} likes</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
