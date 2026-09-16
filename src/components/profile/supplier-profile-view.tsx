"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Building2,
  MapPin,
  Calendar,
  Users,
  Globe2,
  MessageSquare,
  Send,
  Plus,
  Check,
  Share2,
  Package,
  Film,
  FileCheck,
  Star,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  PhoneCall,
  FileCheck2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ProductActionBar } from "@/components/ui/product-action-bar";
import { VariantB2bShowcase } from "@/components/reels/variants/variant-b2b-showcase";
import { SimilarManufacturersWidget } from "@/components/widgets/similar-manufacturers-widget";
import { useBuyerPlan } from "@/features/subscription";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { Reel } from "@/entities/reel";
import { cn } from "@/shared/lib/cn";


type Props = {
  manufacturer: Manufacturer;
  products: Product[];
  reels: Reel[];
  allManufacturers: Manufacturer[];
};

export function SupplierProfileView({
  manufacturer,
  products,
  reels,
  allManufacturers,
}: Props) {
  const [activeTab, setActiveTab] = useState<"products" | "videos" | "about">("products");
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { isSupplierLocked, upgradeTier, openUpgradeModal } = useBuyerPlan();

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // If the buyer is on the Free tier, block full profile access and prompt to upgrade
  if (isSupplierLocked) {
    return (
      <div className="relative min-h-[75vh] w-full rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-xl">
        {/* Blurred preview of the manufacturer behind frosted glass */}
        <div className="absolute inset-0 filter blur-[12px] opacity-35 select-none pointer-events-none scale-105">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={manufacturer.coverUrl} alt="" className="w-full h-48 sm:h-64 object-cover" />
          <div className="p-8 space-y-4 bg-slate-50">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={manufacturer.logoUrl} alt="" className="w-20 h-20 rounded-2xl" />
              <div>
                <h1 className="text-2xl font-black">{manufacturer.name}</h1>
                <p className="text-sm">{manufacturer.location}, {manufacturer.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Frosted glass paywall modal/card positioned directly in center */}
        <div className="relative z-10 flex min-h-[75vh] w-full flex-col items-center justify-center p-4 sm:p-8 bg-slate-900/30 backdrop-blur-md">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 text-center">
            {/* Lock Badge */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs mb-4">
              <Lock className="h-7 w-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200/60 mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Verified Supplier Protected</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Direct Supplier Profile Access Locked
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Full plant inspection reports, machine tooling lines, verified ISO certifications, and direct contact details for <strong className="text-slate-900 font-bold">{manufacturer.name}</strong> are reserved for verified Pro buyers.
            </p>

            {/* 3 Value Pillars */}
            <div className="my-6 grid grid-cols-3 gap-2 sm:gap-3 text-left">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3">
                <div className="h-6 w-6 rounded-lg bg-blue-600/10 text-brand-blue flex items-center justify-center mb-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] font-bold text-slate-900">Plant Audits</p>
                <p className="text-[10px] text-slate-500 leading-tight">ISO 9001, plant size & machines</p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
                <div className="h-6 w-6 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-1.5">
                  <PhoneCall className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] font-bold text-slate-900">Direct Contact</p>
                <p className="text-[10px] text-slate-500 leading-tight">Verified WhatsApp & phone</p>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3">
                <div className="h-6 w-6 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-1.5">
                  <FileCheck2 className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] font-bold text-slate-900">Priority RFQ</p>
                <p className="text-[10px] text-slate-500 leading-tight">&lt; 4h quote response time</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => upgradeTier("pro")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition active:scale-[0.99] cursor-pointer"
              >
                <Sparkles className="h-4 w-4 fill-amber-300 text-amber-300" />
                <span>Upgrade to Pro • Unlock Full Profile (₹3,999/mo)</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                <button
                  type="button"
                  onClick={openUpgradeModal}
                  className="text-brand-blue hover:underline cursor-pointer"
                >
                  Compare All Sourcing Plans
                </button>
                <span>•</span>
                <Link
                  href="/"
                  className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back to Video Feed</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-brand-blue transition-colors">Manufacturers</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">{manufacturer.name}</span>
      </nav>

      {/* 2. Enterprise Hero Factory Header */}
      <Card className="overflow-hidden border-slate-200/90 shadow-sm">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-60 md:h-72 w-full overflow-hidden bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={manufacturer.coverUrl}
            alt={manufacturer.name}
            className="h-full w-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Floating Badges on Cover */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-400 border border-white/10 shadow-xs">
              <Award className="h-3.5 w-3.5" />
              Verified OEM Manufacturer
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/90 border border-white/10 shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ISO 9001 Audited
            </span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900 transition-colors border border-white/10"
              title="Share profile"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copiedLink ? "Link Copied!" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Company Header & Identity */}
        <div className="px-5 pb-5 pt-3 sm:px-8 sm:pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14 sm:-mt-16 relative z-10">
            {/* Logo + Basic Info */}
            <div className="flex items-end gap-4 min-w-0">
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={manufacturer.logoUrl}
                  alt={manufacturer.name}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-white object-cover shadow-lg bg-white"
                />
                {manufacturer.verified && (
                  <div className="absolute -bottom-1.5 -right-1.5 rounded-full bg-white p-0.5 shadow-xs">
                    <VerifiedBadge className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="min-w-0 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {manufacturer.name}
                  </h1>
                  {manufacturer.premium && (
                    <span className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                      Gold Manufacturer
                    </span>
                  )}
                </div>

                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {manufacturer.location}, {manufacturer.country}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Est. {manufacturer.yearsEstablished} ({new Date().getFullYear() - manufacturer.yearsEstablished} yrs)
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    4.9 / 5.0 (140+ reviews)
                  </span>
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => setIsFollowing((v) => !v)}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-all border shadow-2xs active:scale-95",
                  isFollowing
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-800 hover:border-brand-blue hover:bg-blue-50/50 hover:text-brand-blue"
                )}
              >
                {isFollowing ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>

              <Link
                href={`/messages?with=${manufacturer.slug}`}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-brand-blue/40 hover:text-brand-blue transition-all active:scale-95 shadow-2xs"
              >
                <MessageSquare className="h-4 w-4 text-brand-blue" />
                <span>Chat Now</span>
              </Link>

              <Link
                href="/rfq/new"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 text-xs font-bold text-white hover:bg-brand-blue-dark transition-all active:scale-95 shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send RFQ</span>
              </Link>
            </div>
          </div>

          {/* Supplier Key Performance Badges */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
              <Building2 className="h-4 w-4 text-brand-blue shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Plant Area</p>
                <p className="font-bold text-slate-800">{manufacturer.factorySize}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
              <Users className="h-4 w-4 text-brand-blue shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Workforce</p>
                <p className="font-bold text-slate-800">{manufacturer.employees} Employees</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
              <Globe2 className="h-4 w-4 text-brand-blue shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Exports To</p>
                <p className="font-bold text-slate-800 truncate">{manufacturer.exportCountries.slice(0, 3).join(", ")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Response Rate</p>
                <p className="font-bold text-emerald-600">98.4% (&lt; 2h)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Full-View 2-Column Grid (Main 72% / Right 28%) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_390px] gap-6 items-start">
        {/* LEFT COLUMN: Tabs & Main Content */}
        <div className="space-y-5 min-w-0">
          {/* Tabs Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all",
                activeTab === "products"
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              )}
            >
              <Package className="h-4 w-4" />
              <span>Products Catalog</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-semibold">
                {products.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("videos")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all",
                activeTab === "videos"
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              )}
            >
              <Film className="h-4 w-4" />
              <span>Factory Video Seeks</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-semibold">
                {reels.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("about")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all",
                activeTab === "about"
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              )}
            >
              <FileCheck className="h-4 w-4" />
              <span>Overview & Audits</span>
            </button>
          </div>

          {/* TAB CONTENT 1: Products Catalog */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Direct Factory Products</h2>
                  <p className="text-xs text-slate-500">Verified OEM specifications with direct order & quote capabilities</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">{products.length} machines listed</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="group overflow-hidden border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image Link */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="relative block h-48 sm:h-52 w-full overflow-hidden bg-slate-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute top-2.5 left-2.5 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                          OEM Direct
                        </span>
                      </Link>

                      {/* Product Information */}
                      <div className="p-4 pb-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-bold text-sm text-slate-900 hover:text-brand-blue transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Integrated Commerce Action Bar (Price, Buy Now Red, Add to Cart Orange, Chat) */}
                    <div className="p-4 pt-1 border-t border-slate-100 bg-slate-50/50">
                      <ProductActionBar
                        priceInr={product.priceInr}
                        unit={product.unit}
                        moq={product.moq}
                        productSlug={product.slug}
                        manufacturerSlug={manufacturer.slug}
                        size="sm"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

              {/* TAB CONTENT 2: Video Seeks (Rendered in VariantB2bShowcase) */}
              {activeTab === "videos" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Machinery Video Demos & Facility Tours</h2>
                    <p className="text-xs text-slate-500">Live technical demonstrations of manufacturing lines</p>
                  </div>

                  {reels.length === 0 ? (
                    <Card className="p-8 text-center text-sm text-slate-500">
                      No video seeks uploaded for this manufacturer yet.
                    </Card>
                  ) : (
                <div className="space-y-6">
                  {reels.map((reel) => (
                    <VariantB2bShowcase
                      key={reel.id}
                      reel={reel}
                      manufacturer={manufacturer}
                      productSlug={products[0]?.slug}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 3: Factory Overview & Audits */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <Card className="p-5 border-slate-200/90 shadow-2xs space-y-3">
                <h3 className="text-base font-bold text-slate-900">About {manufacturer.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{manufacturer.description}</p>
                {manufacturer.chairmanName && (
                  <p className="pt-2 text-sm text-slate-700">
                    Managing Director / Chairman: <strong className="text-slate-900">{manufacturer.chairmanName}</strong>
                  </p>
                )}
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-5 border-slate-200/90 shadow-2xs space-y-2.5">
                  <h4 className="text-sm font-bold text-slate-900">Plant & Capability</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Factory Floor Space</span>
                      <span className="font-semibold text-slate-800">{manufacturer.factorySize}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Full-Time Staff</span>
                      <span className="font-semibold text-slate-800">{manufacturer.employees}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Years in Operation</span>
                      <span className="font-semibold text-slate-800">{new Date().getFullYear() - manufacturer.yearsEstablished} Years</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-500">Customization</span>
                      <span className="font-semibold text-brand-blue">Full OEM & ODM Supported</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border-slate-200/90 shadow-2xs space-y-2.5">
                  <h4 className="text-sm font-bold text-slate-900">Export & Compliance</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Main Export Markets</span>
                      <span className="font-semibold text-slate-800">{manufacturer.exportCountries.join(", ")}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Quality Certifications</span>
                      <span className="font-semibold text-emerald-600">ISO 9001:2015, CE Certified</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Inspection Standard</span>
                      <span className="font-semibold text-slate-800">100% Pre-Shipment QA</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-500">Audit Status</span>
                      <span className="font-semibold text-slate-800">Verified On-Site</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Dedicated "Explore Similar Profiles" Rail */}
        <aside className="space-y-5 lg:sticky lg:top-24">
          <SimilarManufacturersWidget
            currentManufacturer={manufacturer}
            allManufacturers={allManufacturers}
          />
        </aside>
      </div>
    </div>
  );
}
