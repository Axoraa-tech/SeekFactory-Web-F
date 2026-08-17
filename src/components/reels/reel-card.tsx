"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { EngagementRail } from "@/components/reels/engagement-rail";
import { ReelPlayerChrome } from "@/components/reels/reel-player";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Reel } from "@/entities/reel";

type Props = {
  reel: Reel;
  manufacturer: Manufacturer;
  productSlug?: string;
};

export function ReelCard({ reel, manufacturer, productSlug }: Props) {
  const [following, setFollowing] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl bg-black text-white shadow-card">
      <div className="relative aspect-[16/11] min-h-[420px] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reel.posterUrl}
          alt={reel.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35" />

        <div className="absolute inset-x-0 top-0 flex items-center gap-2.5 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={manufacturer.logoUrl}
            alt=""
            className="h-10 w-10 rounded-full border border-white/40 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-sm font-semibold">
              {manufacturer.name}
              {manufacturer.verified ? <VerifiedBadge className="h-4 w-4" /> : null}
            </p>
            <p className="text-xs text-white/80">{manufacturer.country}</p>
          </div>
          <button
            type="button"
            onClick={() => setFollowing((value) => !value)}
            className="rounded-lg border border-white/70 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
          >
            {following ? "Following" : "Follow"}
          </button>
          <button type="button" className="text-white/80" aria-label="More">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute bottom-12 left-4 right-24 space-y-3">
          <span className="inline-flex rounded-md bg-brand-blue px-2 py-0.5 text-[11px] font-semibold">
            Now Playing
          </span>
          <div>
            <h3 className="text-xl font-bold">{reel.title}</h3>
            <p className="mt-1 max-w-lg text-sm text-white/85">{reel.description}</p>
            <p className="mt-1 text-sm text-white/80">
              {reel.hashtags.map((tag) => `#${tag}`).join(" ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={productSlug ? `/products/${productSlug}` : `/manufacturers/${manufacturer.slug}`}
              className="inline-flex h-10 items-center rounded-lg bg-brand-blue px-4 text-sm font-semibold"
            >
              View Products
            </Link>
            <Link
              href={`/manufacturers/${manufacturer.slug}`}
              className="inline-flex h-10 items-center rounded-lg border border-white/70 px-4 text-sm font-semibold"
            >
              View Manufacturer
            </Link>
          </div>
        </div>

        <div className="absolute bottom-12 right-3 flex flex-col items-center gap-3">
          <EngagementRail
            likes={reel.likes}
            comments={reel.comments}
            shares={reel.shares}
            saves={reel.saves}
          />
          <Link
            href="/messages"
            className="rounded-lg border border-white/70 px-3 py-1.5 text-xs font-semibold"
          >
            Message
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
          <ReelPlayerChrome currentSec={reel.startSec} durationSec={reel.durationSec} />
        </div>
      </div>
    </article>
  );
}
