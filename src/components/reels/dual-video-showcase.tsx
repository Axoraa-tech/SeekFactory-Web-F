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
import { formatCount, formatDuration } from "@/shared/lib/format";
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

function DualTrackCard({ item, isActive, onFocus }: CardProps) {
  const { reel, manufacturer, productSlug, priceInr, moq } = item;
  const [following, setFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(reel.startSec || 0);
  const [duration, setDuration] = useState(reel.durationSec || 30);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [saved, setSaved] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const displayLikes = liked ? reel.likes + 1 : reel.likes;
  const displayReposts = reposted ? reel.shares + 1 : reel.shares;

  // React to isActive focus changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isActive]);

  const handleSeek = (newTimeSec: number) => {
    if (!videoRef.current) return;
    const clamped = Math.max(0, Math.min(newTimeSec, duration));
    videoRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const getTimeFromEvent = (e: React.MouseEvent) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = rect.width > 0 ? clickX / rect.width : 0;
    return ratio * (duration > 0 ? duration : 1);
  };

  const totalDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  return (
    <article
      ref={containerRef}
      onMouseEnter={() => onFocus(item.id)}
      onMouseMove={() => onFocus(item.id)}
      className={cn(
        "group/card relative overflow-hidden rounded-2xl bg-white border transition-all duration-300 shadow-md h-[640px] flex flex-col justify-between shrink-0 snap-start",
        isActive
          ? "border-brand-blue ring-2 ring-brand-blue/25 shadow-xl"
          : "border-slate-200 opacity-95 hover:border-slate-300"
      )}
    >
      {/* Active Focus Top Header */}
      <div
        className={cn(
          "px-3.5 py-1.5 text-xs font-bold flex items-center justify-between transition-colors shrink-0",
          isActive ? "bg-brand-blue text-white" : "bg-slate-900 text-slate-300"
        )}
      >
        <span className="flex items-center gap-1 text-[11px]">
          <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          Verified Factory Showcase
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider",
            isActive
              ? "bg-white text-brand-blue animate-pulse shadow-xs"
              : "bg-slate-800 text-slate-400"
          )}
        >
          {isActive ? (
            <>
              <Sparkles className="h-2.5 w-2.5" />
              <span>LIVE FOCUS</span>
            </>
          ) : (
            <span>PAUSED</span>
          )}
        </span>
      </div>

      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between min-h-0">
        {/* Manufacturer Profile Protected by SupplierLockOverlay */}
        <SupplierLockOverlay badgeLabel="Verified Supplier Locked">
          <div className="flex items-center justify-between gap-2 shrink-0">
            <Link
              href={`/manufacturers/${manufacturer.slug}`}
              className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={manufacturer.logoUrl}
                alt=""
                className="h-9 w-9 rounded-xl border border-slate-200 object-cover shrink-0 shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 flex-wrap">
                  <p className="text-xs font-bold text-ink truncate hover:text-brand-blue transition">
                    {manufacturer.name}
                  </p>
                  {manufacturer.verified ? <VerifiedBadge className="h-3.5 w-3.5 shrink-0" /> : null}
                </div>
                <p className="text-[11px] text-ink-muted truncate">
                  {manufacturer.location} • {formatCount(reel.views)} views
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setFollowing((v) => !v)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition border",
                  following
                    ? "border-slate-200 bg-slate-100 text-slate-700"
                    : "border-brand-blue/30 bg-brand-blue-soft text-brand-blue hover:bg-brand-blue hover:text-white"
                )}
              >
                {following ? "Following" : "Follow"}
              </button>
              <Link
                href="/rfq/new"
                className="inline-flex h-6.5 items-center gap-1 rounded-lg bg-brand-blue px-2.5 text-[11px] font-bold text-white shadow-2xs hover:bg-brand-blue-dark transition active:scale-95"
              >
                <Send className="h-3 w-3" />
                <span>RFQ</span>
              </Link>
            </div>
          </div>
        </SupplierLockOverlay>

        {/* Title */}
        <div className="shrink-0">
          <h3 className="text-xs sm:text-sm font-bold text-ink leading-snug line-clamp-1">
            {reel.title}
          </h3>
          <p className="text-[11px] text-ink-muted line-clamp-1 leading-relaxed">
            {reel.description}
          </p>
        </div>

        {/* Video Player */}
        <div
          onClick={() => onFocus(isActive ? "" : item.id)}
          className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black cursor-pointer shadow-2xs select-none shrink-0"
        >
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.posterUrl}
            loop
            playsInline
            muted={isMuted}
            preload="metadata"
            onTimeUpdate={() => {
              if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
            }}
            onLoadedMetadata={() => {
              if (videoRef.current?.duration) setDuration(videoRef.current.duration);
            }}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            className="h-full w-full object-cover"
          />

          {isBuffering && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
              <div className="rounded-full bg-black/70 p-2.5">
                <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
              </div>
            </div>
          )}

          {!isActive && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-white/20 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg">
                <Play className="h-3.5 w-3.5 fill-white text-white" />
                <span>Hover or Scroll to Play</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted((v) => !v);
              }}
              className="h-6.5 w-6.5 rounded-lg bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition"
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFullscreen();
              }}
              className="h-6.5 w-6.5 rounded-lg bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition"
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
          </div>

          {/* Scrubber */}
          <div
            className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-2.5 pb-1.5 pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={progressBarRef}
              onClick={(e) => handleSeek(getTimeFromEvent(e))}
              className="relative flex h-2.5 w-full cursor-pointer items-center"
            >
              <div className="relative h-1 w-full rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-brand-blue"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/90 pt-0.5 font-mono">
              <span>
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
              <span>{isActive ? "● PLAYING" : "⏸ PAUSED"}</span>
            </div>
          </div>
        </div>

        {/* Technical Specs with SupplierLockOverlay */}
        <SupplierLockOverlay badgeLabel="Factory Specs & Audits Locked" compact>
          <div className="grid grid-cols-4 gap-1.5 text-xs shrink-0">
            <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-200/80">
              <div className="flex items-center gap-0.5 text-slate-500 text-[9px] font-semibold">
                <Layers className="h-2.5 w-2.5 text-brand-blue" />
                <span>CAPACITY</span>
              </div>
              <p className="font-bold text-slate-800 mt-0.5 text-[11px] truncate">500 Units</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-200/80">
              <div className="flex items-center gap-0.5 text-slate-500 text-[9px] font-semibold">
                <PackageCheck className="h-2.5 w-2.5 text-brand-blue" />
                <span>MOQ</span>
              </div>
              <p className="font-bold text-slate-800 mt-0.5 text-[11px] truncate">{moq} MOQ</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-200/80">
              <div className="flex items-center gap-0.5 text-slate-500 text-[9px] font-semibold">
                <Clock className="h-2.5 w-2.5 text-brand-blue" />
                <span>LEAD</span>
              </div>
              <p className="font-bold text-slate-800 mt-0.5 text-[11px] truncate">15 Days</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-200/80">
              <div className="flex items-center gap-0.5 text-slate-500 text-[9px] font-semibold">
                <FileSpreadsheet className="h-2.5 w-2.5 text-brand-blue" />
                <span>CUSTOM</span>
              </div>
              <p className="font-bold text-slate-800 mt-0.5 text-[11px] truncate">OEM/ODM</p>
            </div>
          </div>
        </SupplierLockOverlay>

        {/* Commercial Price Bar */}
        <div className="rounded-xl border border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-blue-50/20 p-2 shadow-2xs shrink-0">
          <ProductActionBar
            priceInr={priceInr}
            unit="piece"
            moq={moq}
            productSlug={productSlug}
            manufacturerSlug={manufacturer.slug}
            size="sm"
          />
        </div>

        {/* Engagement Footer Bar */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-between text-xs select-none shrink-0">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 text-slate-600 hover:text-brand-blue"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="font-medium text-[10px]">{formatCount(reel.comments)}</span>
          </button>
          <span className="h-3.5 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => setReposted((v) => !v)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1 px-1.5 text-slate-600 hover:text-emerald-600",
              reposted && "text-emerald-600"
            )}
          >
            <Repeat2 className="h-3.5 w-3.5" />
            <span className="font-medium text-[10px]">{formatCount(displayReposts)}</span>
          </button>
          <span className="h-3.5 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1 px-1.5 text-slate-600 hover:text-rose-600",
              liked && "text-rose-600"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-rose-500")} />
            <span className="font-medium text-[10px]">{formatCount(displayLikes)}</span>
          </button>
          <span className="h-3.5 w-px bg-slate-200" />
          <div className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 text-slate-500">
            <BarChart2 className="h-3.5 w-3.5" />
            <span className="font-medium text-[10px]">{formatCount(reel.views)}</span>
          </div>
          <span className="h-3.5 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1 px-1.5 text-slate-600 hover:text-brand-blue",
              saved && "text-brand-blue"
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-brand-blue")} />
            <span className="font-medium text-[10px]">{saved ? "Saved" : "Save"}</span>
          </button>
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
    <section className="space-y-4 my-6">
      {/* Section Header */}
      <div className="glass-panel-liquid p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-ink tracking-tight">
                Independent Dual Video Feeds
              </h2>
              <span className="rounded-full bg-brand-orange-soft px-2.5 py-0.5 text-[11px] font-bold text-brand-orange">
                Scroll Tracks Separately
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Scroll Left or Right column individually — only the centered video in your active column plays.
            </p>
          </div>
        </div>

      </div>

      {/* 2 Independent Vertical Scroll Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start">
        {/* COLUMN 1: LEFT TRACK */}
        <div className="space-y-2">
          {/* Column 1 Independent Scroll Container */}
          <div
            ref={trackLeftRef}
            className="h-[640px] overflow-y-auto snap-y snap-mandatory space-y-4 rounded-2xl pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
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
            className="h-[640px] overflow-y-auto snap-y snap-mandatory space-y-4 rounded-2xl pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
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
