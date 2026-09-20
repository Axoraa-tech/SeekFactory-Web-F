"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  Send,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Layers,
  PackageCheck,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  ShoppingCart,
  Zap,
  Check,
  Sparkles,
} from "lucide-react";
import { CommentsModalLazy } from "@/components/reels/comments-modal-lazy";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ProductActionBar } from "@/components/ui/product-action-bar";
import { cn } from "@/shared/lib/cn";
import { formatCount } from "@/shared/lib/format";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Reel } from "@/entities/reel";
import type { Product } from "@/entities/product";
import { useRegionalSettings } from "@/shared/i18n/regional-context";

type Props = {
  reel: Reel;
  manufacturer: Manufacturer;
  productSlug?: string;
  products?: Product[];
  viewMode?: "landscape" | "vertical";
};

/**
 * VariantInstagramProductReel:
 * - In Vertical View: Shows SINGLE products one-by-one in a vertical split card matching the vertical
 *   factory reels, with single product photo, dedicated specs, MOQ, Add to Cart & Buy Now.
 * - In Landscape View: Shows 2x2 product photo grid slides with Buy Now buttons.
 */
export function VariantInstagramProductReel({
  reel,
  manufacturer,
  productSlug,
  products = [],
  viewMode = "landscape",
}: Props) {
  const { t, formatPrice, translateCountry, translateProduct, translateUnit, translateReelTitle, translateReelDescription } = useRegionalSettings();
  const [following, setFollowing] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(reel.comments || 18);

  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [saved, setSaved] = useState(false);

  const displayLikes = liked ? reel.likes + 1 : reel.likes;
  const displayReposts = reposted ? reel.shares + 1 : reel.shares;

  // Single-product index for Vertical view
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Landscape 2x2 slide groups (4 items per slide)
  const pageSize = 4;
  const slides: Product[][] = [];
  for (let i = 0; i < products.length; i += pageSize) {
    slides.push(products.slice(i, i + pageSize));
  }
  if (slides.length === 0) {
    slides.push([]);
  }

  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = slides.length;

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  const [buyingId, setBuyingId] = useState<string | null>(null);

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setBuyingId(product.id);
    setTimeout(() => {
      setBuyingId(null);
      window.location.href = `/products/${product.slug}?action=checkout`;
    }, 400);
  };

  const activeProduct = products[activeProductIndex] || products[0];

  const handlePrevProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProductIndex((prev) => (prev > 0 ? prev - 1 : products.length - 1));
  };

  const handleNextProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProductIndex((prev) => (prev < products.length - 1 ? prev + 1 : 0));
  };

  // =========================================================================
  // 1. VERTICAL VIEW: Single - Single Product Split Layout
  // =========================================================================
  if (viewMode === "vertical" && activeProduct) {
    return (
      <>
        <article className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row h-auto md:h-[620px] transition-shadow hover:shadow-md">
          {/* LEFT COLUMN: Single Product Spotlight & Carousel Frame */}
          <div className="w-full md:w-[56%] relative flex flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-slate-100/70 p-3 sm:p-4 h-[480px] md:h-full overflow-hidden group select-none shrink-0">
            {/* Top Badges */}
            <div className="flex items-center justify-between z-10 shrink-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/75 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Direct OEM Verified
              </span>
              <span className="text-[11px] font-bold text-slate-700 bg-white/90 backdrop-blur-xs border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                Product {activeProductIndex + 1} of {products.length}
              </span>
            </div>

            {/* Center: Hero Product Image with fixed static bounding box */}
            <div className="relative flex-1 min-h-0 w-full flex items-center justify-center p-2 my-auto overflow-hidden">
              <div className="relative h-full w-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={activeProduct.id}
                  src={activeProduct.imageUrl}
                  alt={activeProduct.name}
                  className="max-h-full max-w-full object-contain drop-shadow-md transition-all duration-300 group-hover:scale-105"
                />
              </div>

              {/* Left Arrow */}
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevProduct}
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md border border-slate-200 transition hover:bg-white hover:scale-110 active:scale-95 opacity-85 group-hover:opacity-100"
                  aria-label="Previous product"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}

              {/* Right Arrow */}
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextProduct}
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md border border-slate-200 transition hover:bg-white hover:scale-110 active:scale-95 opacity-85 group-hover:opacity-100"
                  aria-label="Next product"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Bottom: Mini Product Selector Strip (single-single switcher) */}
            <div className="pt-2 z-10 space-y-1.5 shrink-0">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Browse Tagged Products ({products.length})
                </span>
                <span className="text-[10px] font-semibold text-brand-blue">
                  Tap to switch
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {products.map((p, idx) => {
                  const isActive = idx === activeProductIndex;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveProductIndex(idx);
                      }}
                      className={cn(
                        "relative h-12 w-12 shrink-0 rounded-lg border bg-white p-0.5 transition-all overflow-hidden",
                        isActive
                          ? "border-brand-blue ring-2 ring-brand-blue/30 shadow-xs scale-105"
                          : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300"
                      )}
                      title={p.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover rounded-md"
                      />
                      {isActive && (
                        <span className="absolute inset-x-0 bottom-0 h-1 bg-brand-blue rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Industrial Spec Sheet & Sourcing Hub for the Active Single Product */}
          <div className="w-full md:w-[44%] p-4 flex flex-col justify-between bg-slate-50/50 border-t md:border-t-0 md:border-l border-slate-100 md:h-full overflow-y-auto">
            {/* Top: Factory Header */}
            <div className="pb-3 border-b border-slate-200/80 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/manufacturers/${manufacturer.slug}`}
                  className="flex items-center gap-2.5 min-w-0 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={manufacturer.logoUrl}
                    alt={manufacturer.name}
                    className="h-9 w-9 rounded-xl border border-slate-200 object-cover shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-xs text-slate-900 truncate group-hover:text-brand-blue transition-colors">
                        {manufacturer.name}
                      </p>
                      {manufacturer.verified && <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {manufacturer.location}, {translateCountry(manufacturer.country)} · Est. {manufacturer.yearsEstablished}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setFollowing((v) => !v)}
                  className={cn(
                    "shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                    following
                      ? "bg-slate-200 text-slate-700"
                      : "bg-brand-blue text-white hover:bg-brand-blue-dark active:scale-95"
                  )}
                >
                  {following ? t("widgets.following", "Following") : t("widgets.follow", "+ Follow")}
                </button>
              </div>

              {/* Active Single Product Title & Price Card */}
              <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-baseline justify-between gap-1">
                  <div>
                    <span className="text-base sm:text-lg font-black text-rose-600">
                      {formatPrice(activeProduct.priceInr)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / {translateUnit(activeProduct.unit)}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                    MOQ: {activeProduct.moq}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-800 line-clamp-1">
                  {translateProduct(activeProduct.name)}
                </p>
              </div>
            </div>

            {/* Middle: 4 Industrial Technical Spec Chips */}
            <div className="flex-1 my-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Product Specifications</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> On-site Audited
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Layers className="h-3 w-3 text-brand-blue" />
                    <span>Material</span>
                  </p>
                  <p className="font-bold text-xs text-slate-800 mt-0.5 truncate">
                    {activeProduct.specs?.["Material"] || "AISI 4140"}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span>Lead Time</span>
                  </p>
                  <p className="font-bold text-xs text-slate-800 mt-0.5 truncate">
                    {activeProduct.specs?.["Lead Time"] || "10 - 15 Days"}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    <span>Tolerance</span>
                  </p>
                  <p className="font-bold text-xs text-slate-800 mt-0.5 truncate">
                    {activeProduct.specs?.["Tolerance"] || "±0.005 mm"}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    <span>Compliance</span>
                  </p>
                  <p className="font-bold text-xs text-slate-800 mt-0.5 truncate">
                    ISO 9001:2015
                  </p>
                </div>
              </div>

              {/* Sourcing Manager Online */}
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100/90 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Sourcing Manager Online</p>
                    <p className="text-[10px] text-slate-500">Avg. Response &lt; 2 Hours</p>
                  </div>
                </div>
                <Link
                  href={`/messages?with=${manufacturer.slug}`}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-xs font-bold text-brand-blue hover:bg-blue-50 transition-colors shadow-2xs"
                >
                  Chat
                </Link>
              </div>
            </div>

            {/* Action Commerce Bar */}
            <div className="pt-3 border-t border-slate-200/80 space-y-2 shrink-0">
              <div className="flex items-center gap-2">
                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddedToCart(true);
                    setTimeout(() => setIsAddedToCart(false), 2000);
                  }}
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  {isAddedToCart ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                {/* Buy Now Button (Vibrant Red) */}
                <button
                  type="button"
                  disabled={buyingId === activeProduct.id}
                  onClick={(e) => handleBuyNow(e, activeProduct)}
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-75"
                >
                  <Zap className="h-3.5 w-3.5 fill-white/80" />
                  <span>{buyingId === activeProduct.id ? "Processing..." : "Buy Now"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <Link
                  href={`/products/${activeProduct.slug}`}
                  className="text-[11px] font-semibold text-slate-600 hover:text-brand-blue"
                >
                  View Full Specs →
                </Link>
                <Link
                  href="/rfq/new"
                  className="text-[11px] font-bold text-brand-blue hover:underline"
                >
                  Request Custom RFQ
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Modal */}
        <CommentsModalLazy
          reelId={reel.id}
          reelTitle={reel.title}
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
        />
      </>
    );
  }

  // =========================================================================
  // 2. LANDSCAPE VIEW: Consistent 16:9 Showcase with 2x2 Grid & Buy Now Buttons
  // =========================================================================
  const primaryProduct = products[0];

  return (
    <>
      <article className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs transition-all hover:shadow-md overflow-hidden">
        {/* 1. Distinct Header Bar: Verified Badges Ribbon */}
        <div className="flex items-center justify-between bg-neutral-900 px-3.5 sm:px-4 py-1.5 text-xs text-neutral-300">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <Award className="h-3.5 w-3.5" />
              Verified OEM Manufacturer
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400">ISO 9001 Audited</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Factory
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 pb-2 sm:pb-2.5 space-y-2.5">
          {/* 2. Manufacturer Header */}
          <div className="flex items-center justify-between">
            <Link
              href={productSlug ? `/products/${productSlug}` : `/manufacturers/${manufacturer.slug}`}
              className="flex items-center gap-3 hover:opacity-90 transition min-w-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={manufacturer.logoUrl}
                alt=""
                className="h-10 w-10 rounded-lg border border-neutral-200 object-cover shadow-xs flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-ink hover:text-brand-blue transition">
                    {manufacturer.name}
                  </p>
                  {manufacturer.verified ? <VerifiedBadge className="h-4 w-4" /> : null}
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  {translateCountry(manufacturer.country)} • {formatCount(reel.views)} {t("feed.views", "views")}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFollowing((v) => !v)}
                className={cn(
                  "rounded-full px-3.5 py-1 text-xs font-bold transition",
                  following
                    ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                )}
              >
                {following ? t("widgets.following", "Following") : t("widgets.follow", "+ Follow")}
              </button>

              <Link
                href="/rfq/new"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-3 py-1 text-xs font-bold text-white hover:bg-brand-blue-dark transition shadow-2xs"
              >
                <Send className="h-3 w-3" /> {t("feed.sendRfq", "Send RFQ")}
              </Link>
            </div>
          </div>

          {/* 3. Title and Description */}
          <div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 leading-snug">
              {translateReelTitle(reel.title)}
            </h2>
            <p className="text-xs text-neutral-600 line-clamp-2 mt-0.5">
              {translateReelDescription(reel.description)}
            </p>
          </div>

          {/* 4. Interactive 16:9 Media Plane with 2x2 Product Photo Grid */}
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-xs group select-none">
            {/* Carousel Slide Track */}
            <div
              className="flex h-full w-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {slides.map((group, slideIdx) => (
                <div
                  key={slideIdx}
                  className="grid grid-cols-2 grid-rows-2 h-full w-full shrink-0 divide-x divide-y divide-neutral-200 bg-white"
                >
                  {group.map((prod) => {
                    const isBuying = buyingId === prod.id;

                    return (
                      <div
                        key={prod.id}
                        className="group/item relative flex flex-col justify-between bg-white p-2 sm:p-2.5 transition-colors hover:bg-neutral-50 overflow-hidden"
                      >
                        {/* Top Micro Badges */}
                        <div className="flex items-center justify-between z-10">
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-black/65 backdrop-blur-xs px-1.5 py-0.2 text-[9px] font-bold text-white">
                            <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                            Direct OEM
                          </span>
                          <span className="text-[9px] font-semibold text-neutral-500 bg-neutral-100 px-1 py-0.2 rounded">
                            MOQ: {prod.moq}
                          </span>
                        </div>

                        {/* Product Photo with hover scale */}
                        <div className="relative flex-1 w-full flex items-center justify-center p-1 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.imageUrl}
                            alt={translateProduct(prod.name)}
                            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/item:scale-105"
                          />
                        </div>

                        {/* Bottom Row: Name, Price, and Buy Now Button */}
                        <div className="pt-1 border-t border-neutral-100 flex items-center justify-between gap-1 z-10">
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/products/${prod.slug}`}
                              className="text-[11px] sm:text-xs font-bold text-neutral-900 group-hover/item:text-brand-blue truncate block"
                              title={translateProduct(prod.name)}
                            >
                              {translateProduct(prod.name)}
                            </Link>
                            <span className="text-[11px] sm:text-xs font-extrabold text-brand-orange">
                              {formatPrice(prod.priceInr)}
                              <span className="text-[9px] text-neutral-400 font-normal"> / {translateUnit(prod.unit)}</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleBuyNow(e, prod)}
                            disabled={isBuying}
                            className={cn(
                              "inline-flex h-5 sm:h-6 items-center justify-center gap-1 rounded px-2 text-[10px] font-bold text-white transition active:scale-95 shadow-2xs shrink-0",
                              isBuying
                                ? "bg-red-400 cursor-wait"
                                : "bg-[#E53935] hover:bg-[#D32F2F]"
                            )}
                          >
                            {isBuying ? "..." : t("common.buyNow", "Buy Now")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Slide Arrows on Hover */}
            {activeSlide > 0 && (
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Previous products"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md border border-neutral-200 transition hover:bg-white hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            )}

            {activeSlide < totalSlides - 1 && (
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Next products"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md border border-neutral-200 transition hover:bg-white hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Instagram Style Dot Indicators */}
            {totalSlides > 1 && (
              <div className="absolute bottom-2 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
                {slides.map((_, dotIdx) => (
                  <span
                    key={dotIdx}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      dotIdx === activeSlide
                        ? "w-4 bg-brand-blue shadow-sm"
                        : "w-1.5 bg-neutral-400/80"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 5. DISTINCT DESIGN 1: Industrial Technical Spec Sheet (4 Clean Chips) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-neutral-50/80 border border-neutral-200/60">
              <p className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                <Layers className="h-3 w-3 text-brand-blue" />
                <span>CATALOG</span>
              </p>
              <p className="font-bold text-neutral-800 mt-0.5 text-xs truncate">
                {products.length} Tagged Products
              </p>
            </div>

            <div className="p-2 rounded-xl bg-neutral-50/80 border border-neutral-200/60">
              <p className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                <PackageCheck className="h-3 w-3 text-emerald-500" />
                <span>MIN. ORDER</span>
              </p>
              <p className="font-bold text-neutral-800 mt-0.5 text-xs truncate">
                {primaryProduct?.moq || "1 Set / MOQ"}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-neutral-50/80 border border-neutral-200/60">
              <p className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-500" />
                <span>LEAD TIME</span>
              </p>
              <p className="font-bold text-neutral-800 mt-0.5 text-xs truncate">
                10–15 Days
              </p>
            </div>

            <div className="p-2 rounded-xl bg-neutral-50/80 border border-neutral-200/60">
              <p className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                <FileSpreadsheet className="h-3 w-3 text-purple-500" />
                <span>CUSTOMIZATION</span>
              </p>
              <p className="font-bold text-neutral-800 mt-0.5 text-xs truncate">
                OEM & ODM
              </p>
            </div>
          </div>

          {/* 6. B2B Commercial Bar */}
          <div className="rounded-xl border border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-blue-50/20 p-2.5 shadow-2xs">
            <ProductActionBar
              priceInr={primaryProduct?.priceInr || 450}
              unit={primaryProduct?.unit || "piece"}
              moq={100}
              productSlug={primaryProduct?.slug || productSlug}
              manufacturerSlug={manufacturer.slug}
              size="sm"
            />
          </div>

          {/* 7. DISTINCT DESIGN 3: Industrial Segmented 5-Button Bar */}
          <div className="rounded-xl bg-neutral-50/90 border border-neutral-200/70 p-1 flex items-center justify-between text-xs select-none">
            {/* 1. Comments */}
            <button
              type="button"
              onClick={() => setIsCommentsOpen(true)}
              className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-neutral-600 hover:bg-white hover:text-brand-blue hover:shadow-xs transition"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="font-medium text-[11px]">{formatCount(commentCount)}</span>
            </button>

            <span className="h-4 w-px bg-neutral-200" />

            {/* 2. Reposts */}
            <button
              type="button"
              onClick={() => setReposted((v) => !v)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-neutral-600 hover:bg-white hover:text-brand-blue hover:shadow-xs transition",
                reposted && "text-brand-blue bg-white shadow-xs"
              )}
            >
              <Repeat2 className="h-3.5 w-3.5" />
              <span className="font-medium text-[11px]">{formatCount(displayReposts)}</span>
            </button>

            <span className="h-4 w-px bg-neutral-200" />

            {/* 3. Likes */}
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-neutral-600 hover:bg-white hover:text-rose-600 hover:shadow-xs transition",
                liked && "text-rose-600 bg-white shadow-xs"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", liked && "fill-rose-500")} />
              <span className="font-medium text-[11px]">{formatCount(displayLikes)}</span>
            </button>

            <span className="h-4 w-px bg-neutral-200" />

            {/* 4. Impressions */}
            <div className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-neutral-500 cursor-default">
              <BarChart2 className="h-3.5 w-3.5" />
              <span className="font-medium text-[11px]">{formatCount(reel.views)}</span>
            </div>

            <span className="h-4 w-px bg-neutral-200" />

            {/* 5. Save */}
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-neutral-600 hover:bg-white hover:text-brand-blue hover:shadow-xs transition",
                saved && "text-brand-blue bg-white shadow-xs"
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-brand-blue")} />
              <span className="font-medium text-[11px]">{saved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </article>

      {/* Comments Modal */}
      <CommentsModalLazy
        reelId={reel.id}
        reelTitle={reel.title}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
    </>
  );
}
