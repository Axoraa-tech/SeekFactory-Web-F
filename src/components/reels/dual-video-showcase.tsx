"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Award,
  BarChart2,
  Bookmark,
  Clock,
  FileSpreadsheet,
  Heart,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  MessageCircle,
  PackageCheck,
  Play,
  Repeat2,

  Send,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ProductActionBar } from "@/components/ui/product-action-bar";
import { SupplierLockOverlay } from "@/components/reels/supplier-lock-overlay";
import { formatCount, formatDuration, formatPriceInr } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Reel } from "@/entities/reel";

interface ReelItemData {
  id: string;
  reel: Reel;
  manufacturer: Manufacturer;
  productSlug: string;
  priceInr: number;
  moq: number;
}

const LEFT_TRACK_ITEMS: ReelItemData[] = [
  {
    id: "A-1",
    reel: {
      id: "reel-a1-cnc",
      manufacturerId: "mfr-bharat",
      title: "5-Axis High-Precision CNC Machining & Micro-Tolerances",
      description:
        "Live turned and milled aluminium housings with continuous optical inspection. Direct factory exports to UAE, Europe & USA.",
      hashtags: ["CNCMachining", "5Axis", "PrecisionEngineering"],
      posterUrl:
        "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=900&q=80",
      videoUrl: "/videos/reel-3-cnc-milling.mp4",
      durationSec: 28,
      startSec: 0,
      views: 48920,
      likes: 2410,
      comments: 18,
      shares: 114,
      saves: 382,
      tab: "for-you",
      productIds: ["prd-milling-spindle"],
    },
    manufacturer: {
      id: "mfr-bharat",
      slug: "bharat-precision-tools",
      name: "Bharat Precision Tools",
      logoUrl:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=200&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=900&q=80",
      country: "India",
      location: "Coimbatore, Tamil Nadu",
      verified: true,
      premium: true,
      yearsEstablished: 2004,
      factorySize: "18,000 sq.m",
      employees: "210+",
      exportCountries: ["India", "UAE", "Germany"],
      description: "Precision CNC tooling and multi-axis machining for Tier-1 OEMs.",
      followerCount: 6210,
      categoryIds: ["cat-cnc-vmc-machines"],
    },
    productSlug: "5-axis-cnc-milling-spindle",
    priceInr: 42500,
    moq: 1,
  },
  {
    id: "A-2",
    reel: {
      id: "reel-a2-sheet",
      manufacturerId: "mfr-metalcraft",
      title: "Fiber Laser Cutting & Precision Sheet Metal Fabrication",
      description:
        "High-speed 6kW fiber laser cutting up to 20mm steel. Bending, TIG welding, and powder coating for industrial enclosures.",
      hashtags: ["LaserCutting", "SheetMetal", "Fabrication"],
      posterUrl:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80",
      videoUrl: "/videos/reel-1-agri-machinery.mp4",
      durationSec: 32,
      startSec: 0,
      views: 28400,
      likes: 1340,
      comments: 12,
      shares: 64,
      saves: 198,
      tab: "for-you",
      productIds: ["prd-sheet-encl"],
    },
    manufacturer: {
      id: "mfr-metalcraft",
      slug: "metalcraft-solutions",
      name: "MetalCraft Solutions",
      logoUrl:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=200&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80",
      country: "India",
      location: "Rajkot, Gujarat",
      verified: true,
      premium: false,
      yearsEstablished: 2011,
      factorySize: "12,500 sq.m",
      employees: "160+",
      exportCountries: ["India", "UAE"],
      description: "Sheet metal fabrication, laser cutting, and powder coating.",
      followerCount: 3890,
      categoryIds: ["cat-cnc-plasma-cutting-machine"],
    },
    productSlug: "sheet-metal-enclosures",
    priceInr: 890,
    moq: 25,
  },
  {
    id: "A-3",
    reel: {
      id: "reel-a3-cutters",
      manufacturerId: "mfr-bharat",
      title: "Solid Micro-Grain Carbide End Mill Tooling & Cutters",
      description:
        "TiAlN coated 4-flute solid carbide end mills engineered for hardened steel milling up to HRC 65.",
      hashtags: ["Tooling", "EndMill", "CNCTools"],
      posterUrl:
        "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=900&q=80",
      videoUrl: "/videos/reel-3-cnc-milling.mp4",
      durationSec: 24,
      startSec: 0,
      views: 19200,
      likes: 980,
      comments: 9,
      shares: 42,
      saves: 156,
      tab: "for-you",
      productIds: ["prd-carbide-cutters"],
    },
    manufacturer: {
      id: "mfr-bharat",
      slug: "bharat-precision-tools",
      name: "Bharat Precision Tools",
      logoUrl:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=200&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=900&q=80",
      country: "India",
      location: "Coimbatore, Tamil Nadu",
      verified: true,
      premium: true,
      yearsEstablished: 2004,
      factorySize: "18,000 sq.m",
      employees: "210+",
      exportCountries: ["India", "UAE", "Germany"],
      description: "Precision CNC tooling and multi-axis machining for Tier-1 OEMs.",
      followerCount: 6210,
      categoryIds: ["cat-cnc-vmc-machines"],
    },
    productSlug: "tungsten-carbide-end-mill-cutters",
    priceInr: 1850,
    moq: 5,
  },
];

const RIGHT_TRACK_ITEMS: ReelItemData[] = [
  {
    id: "B-1",
    reel: {
      id: "reel-b1-forging",
      manufacturerId: "mfr-apex",
      title: "Precision Closed-Die Forging & Drive Shaft Lineup",
      description:
        "Multi-station 1600T heavy press line forging closed-die drivetrain components with in-house heat treatment.",
      hashtags: ["Forging", "HeavyMachinery", "Automotive"],
      posterUrl:
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=80",
      videoUrl: "/videos/reel-2-factory-tour.mp4",
      durationSec: 36,
      startSec: 0,
      views: 34100,
      likes: 1890,
      comments: 24,
      shares: 88,
      saves: 245,
      tab: "for-you",
      productIds: ["prd-forged-shaft"],
    },
    manufacturer: {
      id: "mfr-apex",
      slug: "apex-forgings",
      name: "Apex Forgings Pvt. Ltd.",
      logoUrl:
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=200&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=80",
      country: "India",
      location: "Pune, Maharashtra",
      verified: true,
      premium: true,
      yearsEstablished: 1998,
      factorySize: "42,000 sq.m",
      employees: "480+",
      exportCountries: ["UAE", "Germany", "USA"],
      description: "Closed-die forging specialist for automotive & heavy machinery.",
      followerCount: 12840,
      categoryIds: ["cat-die-casting-machine"],
    },
    productSlug: "forged-drive-shafts",
    priceInr: 1280,
    moq: 50,
  },
  {
    id: "B-2",
    reel: {
      id: "reel-b2-hydraulic",
      manufacturerId: "mfr-ningbo",
      title: "Cast-Iron Hydraulic Gear Pumps & Fluid Power Units",
      description:
        "High-pressure hydraulic gear pumps built for heavy industrial excavators and injection molding machinery.",
      hashtags: ["Hydraulics", "FluidPower", "GearPump"],
      posterUrl:
        "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80",
      videoUrl: "/videos/reel-1-agri-machinery.mp4",
      durationSec: 40,
      startSec: 0,
      views: 18450,
      likes: 910,
      comments: 15,
      shares: 52,
      saves: 167,
      tab: "for-you",
      productIds: ["prd-hydraulic"],
    },
    manufacturer: {
      id: "mfr-ningbo",
      slug: "ningbo-kaiyuan-fluid",
      name: "Ningbo Kaiyuan Fluid Power",
      logoUrl:
        "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=900&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80",
      country: "China",
      location: "Ningbo, Zhejiang",
      verified: true,
      premium: true,
      yearsEstablished: 1996,
      factorySize: "38,000 sq.m",
      employees: "540+",
      exportCountries: ["India", "Germany", "Turkey"],
      description: "Hydraulic components and precision fluid-power assemblies.",
      followerCount: 9104,
      categoryIds: ["cat-automobiles-equipments-evs"],
    },
    productSlug: "hydraulic-gear-pump",
    priceInr: 3200,
    moq: 10,
  },
  {
    id: "B-3",
    reel: {
      id: "reel-b3-steelforge",
      manufacturerId: "mfr-steelforge",
      title: "Closed-Die Automotive Drivetrain & Flange Forgings",
      description:
        "SGS-audited hot forging line producing high-volume carbon and alloy steel components for overseas OEMs.",
      hashtags: ["AutomotiveForging", "SGS", "OEMFactory"],
      posterUrl:
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=900&q=80",
      videoUrl: "/videos/reel-2-factory-tour.mp4",
      durationSec: 30,
      startSec: 0,
      views: 31200,
      likes: 1650,
      comments: 21,
      shares: 79,
      saves: 289,
      tab: "for-you",
      productIds: ["prd-die-forging"],
    },
    manufacturer: {
      id: "mfr-steelforge",
      slug: "steelforge-industries",
      name: "SteelForge Industries",
      logoUrl:
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=200&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=900&q=80",
      country: "China",
      location: "Ningbo, Zhejiang",
      verified: true,
      premium: true,
      yearsEstablished: 2001,
      factorySize: "65,000 sq.m",
      employees: "920+",
      exportCountries: ["India", "UAE", "Brazil"],
      description: "Hot forging and CNC finishing for drivetrain hardware.",
      followerCount: 15402,
      categoryIds: ["cat-die-casting-machine"],
    },
    productSlug: "closed-die-forgings",
    priceInr: 620,
    moq: 200,
  },
];

interface CardProps {
  item: ReelItemData;
  isActive: boolean;
  onFocus: (id: string) => void;
}

function getCountryFlag(country: string) {
  if (country?.includes("India")) return "🇮🇳";
  if (country?.includes("China")) return "🇨🇳";
  if (country?.includes("USA") || country?.includes("United States")) return "🇺🇸";
  if (country?.includes("Germany")) return "🇩🇪";
  if (country?.includes("UAE") || country?.includes("Dubai")) return "🇦🇪";
  if (country?.includes("Japan")) return "🇯🇵";
  return "🌐";
}

function formatMinSec(durationSec?: number) {
  if (!durationSec) return "0:36";
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function DualTrackCard({ item, isActive, onFocus }: CardProps) {
  const { reel, manufacturer, productSlug, priceInr, moq } = item;
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onFocus(item.id);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <article
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group/card relative overflow-hidden rounded-2xl bg-white border p-3 sm:p-3.5 transition-all duration-300 shadow-xs hover:shadow-xl select-none snap-start flex flex-col justify-between",
        isHovered
          ? "border-brand-blue ring-2 ring-brand-blue/20"
          : "border-slate-200/90 hover:border-slate-300"
      )}
    >
      {/* Video / Poster Thumbnail Container */}
      <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-slate-950 shrink-0 cursor-pointer">
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.posterUrl}
          loop
          playsInline
          muted={isMuted}
          preload="none"
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            isHovered ? "scale-105" : "scale-100"
          )}
        />

        {isBuffering && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
            <div className="rounded-full bg-black/70 p-2.5">
              <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
            </div>
          </div>
        )}

        {/* Mute button on hover */}
        {isHovered && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted((v) => !v);
            }}
            className="absolute top-2.5 right-2.5 z-30 h-7 w-7 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center hover:bg-black/80 transition shadow-md cursor-pointer"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Bottom Overlay on Video Thumbnail: Duration Pill & Views Count */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
          {/* Duration Pill: ▶ 0:36 */}
          <span className="inline-flex items-center gap-1 rounded-md bg-black/65 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
            <Play className="h-2.5 w-2.5 fill-white text-white" />
            <span>{formatMinSec(reel.durationSec)}</span>
          </span>

          {/* Views Count */}
          <span className="text-[11px] font-bold text-white/95 drop-shadow-xs">
            {formatCount(reel.views)} views
          </span>
        </div>
      </div>

      {/* Details Below Thumbnail Image */}
      <div className="mt-3 space-y-1.5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Title */}
          <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-1 group-hover/card:text-brand-blue transition-colors">
            {reel.title}
          </h3>

          {/* Supplier Name + Verified Badge */}
          <SupplierLockOverlay badgeLabel="View Manufacturer">
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 font-semibold truncate">
              <span className="truncate">{manufacturer.name}</span>
              {manufacturer.verified && <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />}
            </div>
          </SupplierLockOverlay>

          {/* Flag + Location Pill */}
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium truncate">
            <span className="text-sm">{getCountryFlag(manufacturer.country)}</span>
            <span className="truncate">{manufacturer.country} · {manufacturer.location.split(",")[0]}</span>
          </div>
        </div>

        {/* Price & MOQ Tag */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-rose-600">
              {formatPriceInr(priceInr)}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">/piece</span>
          </div>
          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200/70">
            {moq} pieces
          </span>
        </div>
      </div>
    </article>
  );
}

export function DualVideoShowcase() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>("A-1");

  const trackLeftRef = useRef<HTMLDivElement>(null);
  const trackRightRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for detecting snapped active video in each track
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const itemId = entry.target.getAttribute("data-reel-id");
            if (itemId) {
              setActiveVideoId(itemId);
            }
          }
        }
      },
      { threshold: [0.5, 0.75] }
    );

    const cards = document.querySelectorAll("[data-reel-id]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const handleCardFocus = useCallback((id: string) => {
    setActiveVideoId(id);
  }, []);

  return (
    <section className="space-y-4 my-2">

      {/* 2 Independent Vertical Scroll Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start">
        {/* COLUMN 1: LEFT TRACK */}
        <div className="space-y-2">
          {/* Column 1 Independent Scroll Container */}
          <div
            ref={trackLeftRef}
            className="h-[calc(100vh-210px)] min-h-[680px] overflow-y-auto snap-y snap-mandatory space-y-4 rounded-2xl pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
          >
            {LEFT_TRACK_ITEMS.map((item) => (
              <div key={item.id} data-reel-id={item.id}>
                <DualTrackCard
                  item={item}
                  isActive={activeVideoId === item.id}
                  onFocus={handleCardFocus}
                />
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: RIGHT TRACK */}
        <div className="space-y-2">
          {/* Column 2 Independent Scroll Container */}
          <div
            ref={trackRightRef}
            className="h-[calc(100vh-210px)] min-h-[680px] overflow-y-auto snap-y snap-mandatory space-y-4 rounded-2xl pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
          >
            {RIGHT_TRACK_ITEMS.map((item) => (
              <div key={item.id} data-reel-id={item.id}>
                <DualTrackCard
                  item={item}
                  isActive={activeVideoId === item.id}
                  onFocus={handleCardFocus}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
