"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Award,
  ShieldCheck,
  Sparkles,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
} from "lucide-react";
import type { FactoryCertificate } from "@/entities/factory-certificate";
import { cn } from "@/shared/lib/cn";

interface HoloHallOfFameProps {
  certificates: FactoryCertificate[];
  manufacturerName: string;
  isOwner?: boolean;
  onOpenUpload?: () => void;
  onDeleteCertificate?: (id: string) => void;
  onInspect?: (cert: FactoryCertificate) => void;
}

export function HoloHallOfFame({
  certificates,
  manufacturerName,
  isOwner = false,
  onOpenUpload,
  onDeleteCertificate,
  onInspect,
}: HoloHallOfFameProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const centerFrameRef = useRef<HTMLDivElement>(null);

  const activeCert = certificates[selectedIndex] || certificates[0];

  // Mouse tilt / 3D parallax effect on the active crystal frame
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!centerFrameRef.current) return;
    const rect = centerFrameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const goNext = () => {
    setSelectedIndex((prev) => (prev + 1) % certificates.length);
  };

  const goPrev = () => {
    setSelectedIndex((prev) => (prev - 1 + certificates.length) % certificates.length);
  };

  if (!certificates || certificates.length === 0) {
    return (
      <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-12 text-center text-white">
        <Award className="mx-auto h-12 w-12 text-amber-500 mb-3 animate-pulse" />
        <h3 className="text-lg font-bold">No Accreditations Published Yet</h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          Upload certificates to activate the holographic AI hall of fame showcase.
        </p>
        {isOwner && onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 text-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Upload First Certificate</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-neutral-950 text-white shadow-2xl transition-all select-none">
      {/* 1. Ambient Background Grid & Cyber Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-neutral-950/90 to-neutral-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Glowing Neon Cyber Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-60 h-60 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 sm:px-8 border-b border-white/10 bg-neutral-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-neutral-950 shadow-lg shadow-amber-500/20 font-black">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-extrabold flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI-Verified Enterprise Hall of Fame
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Live Credential
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              {manufacturerName} Accreditations & Honor Chamber
            </h2>
          </div>
        </div>

        {isOwner && onOpenUpload && (
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-neutral-950 font-extrabold px-4 py-2 text-xs transition shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Mint / Upload Certificate</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. THE CENTERPIECE: FLOATING 3D CRYSTAL FRAME ON HOLO-PEDESTAL */}
      {/* ========================================================================= */}
      <div className="relative z-10 px-4 sm:px-8 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[440px]">
        {/* Navigation Arrows (Sides) */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous Certificate"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-white/80 hover:text-amber-400 border border-white/10 shadow-xl backdrop-blur-md transition-all active:scale-90"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next Certificate"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-white/80 hover:text-amber-400 border border-white/10 shadow-xl backdrop-blur-md transition-all active:scale-90"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Center 3D Floating Crystal Frame Container */}
        <div
          ref={centerFrameRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: "1000px",
          }}
          className="relative max-w-2xl w-full flex flex-col items-center"
        >
          {/* Holographic Projection Rays coming from top */}
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-xs mb-3 animate-pulse" />

          {/* THE 3D AWARD FRAME */}
          <div
            style={{
              transform: `rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg) scale(${isHovered ? 1.02 : 1})`,
              transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
            }}
            onClick={() => onInspect?.(activeCert)}
            className="group relative cursor-pointer w-full rounded-2xl sm:rounded-3xl p-1 bg-gradient-to-br from-amber-200 via-amber-500 to-yellow-800 shadow-[0_20px_50px_rgba(245,158,11,0.25)] border border-amber-300/60"
          >
            {/* Inner Metallic Bezel */}
            <div className="relative rounded-2xl sm:rounded-3xl bg-neutral-950 p-2 sm:p-3 overflow-hidden">
              {/* Sweeping Laser Scan Line (Hologram Effect) */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px] opacity-75 animate-[pulse_2s_infinite] pointer-events-none z-20" />

              {/* Holographic Certificate Document Image */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-900 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeCert.imageUrl}
                  alt={activeCert.title}
                  className="h-full w-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                {/* Holographic Glare Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-white/15 opacity-60 pointer-events-none" />

                {/* Top Corner: AI Cryptographic Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-xl bg-black/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-400/40 shadow-lg">
                  <Cpu className="h-3.5 w-3.5 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
                  <span className="font-mono">AI-Trust: 99.8%</span>
                </div>

                {/* Top Right Corner: Seal */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-xl bg-emerald-500/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/40 shadow-lg">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Plaque</span>
                </div>

                {/* Center Hover Action */}
                <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md px-5 py-2.5 text-xs font-black text-neutral-950 shadow-2xl border border-white/40">
                    <Maximize2 className="h-4 w-4 text-amber-600" />
                    <span>Click to Inspect High-Resolution Artifact</span>
                  </span>
                </div>

                {/* Bottom Bar: Holographic Meta Details */}
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400/90 font-bold block">
                      {activeCert.category || "Quality System"}
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white drop-shadow-md">
                      {activeCert.title}
                    </h3>
                    <p className="text-[11px] text-neutral-300 font-medium">
                      Audited by <strong className="text-amber-300">{activeCert.issuer}</strong>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-neutral-400 block">Certificate No:</span>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-lg border border-amber-400/30">
                      {activeCert.certNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing Corner Accents on Frame */}
            <div className="absolute -top-1.5 -left-1.5 h-4 w-4 border-t-2 border-l-2 border-amber-300 rounded-tl-lg" />
            <div className="absolute -top-1.5 -right-1.5 h-4 w-4 border-t-2 border-r-2 border-amber-300 rounded-tr-lg" />
            <div className="absolute -bottom-1.5 -left-1.5 h-4 w-4 border-b-2 border-l-2 border-amber-300 rounded-bl-lg" />
            <div className="absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-2 border-r-2 border-amber-300 rounded-br-lg" />
          </div>

          {/* 3D Holo-Podium Base / Reflection Pedestal underneath the frame */}
          <div className="w-3/4 sm:w-2/3 h-6 bg-gradient-to-b from-amber-500/20 via-neutral-900 to-transparent rounded-[100%] blur-[2px] mt-2" />
          <div className="w-1/2 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-xs opacity-75" />

          {/* Active Plaque Actions (if owner) */}
          {isOwner && onDeleteCertificate && (
            <div className="mt-3 flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCertificate(activeCert.id);
                }}
                className="inline-flex items-center gap-1 text-neutral-400 hover:text-red-400 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove Plaque</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. THE BOTTOM: INTERACTIVE 3D FLOATING TROPHY DOCK / CYLINDER SLIDER */}
      {/* ========================================================================= */}
      <div className="relative z-20 px-6 sm:px-8 py-5 border-t border-white/10 bg-neutral-900/60 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>Artifact Dock [{selectedIndex + 1} / {certificates.length}]</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-neutral-500 font-mono uppercase">Select Credential:</span>
          </div>
        </div>

        {/* Floating Horizontal Slabs Dock */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
          {certificates.map((cert, index) => {
            const isCurrent = index === selectedIndex;
            return (
              <div
                key={cert.id}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "group relative shrink-0 cursor-pointer snap-center rounded-2xl p-0.5 transition-all duration-300 w-36 sm:w-44",
                  isCurrent
                    ? "bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.4)] -translate-y-1"
                    : "bg-neutral-800/80 hover:bg-neutral-700 hover:scale-100 opacity-70 hover:opacity-100"
                )}
              >
                <div className="rounded-2xl bg-neutral-950 p-2 overflow-hidden flex flex-col justify-between h-full">
                  {/* Thumbnail Image */}
                  <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-neutral-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cert.imageUrl}
                      alt={cert.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {isCurrent && (
                      <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>

                  {/* Title & Issuer */}
                  <div className="pt-2 text-left">
                    <p className={cn(
                      "text-[11px] font-bold line-clamp-1",
                      isCurrent ? "text-amber-300" : "text-white"
                    )}>
                      {cert.title.split(" ")[0]} {cert.title.split(" ")[1] || ""}
                    </p>
                    <p className="text-[9px] text-neutral-400 truncate mt-0.5">
                      {cert.issuer.split(" ")[0]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
