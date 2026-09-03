"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { cn } from "@/shared/lib/cn";
import type { Manufacturer } from "@/entities/manufacturer";

type Props = {
  manufacturers: Manufacturer[];
};

export function VerifiedManufacturers({ manufacturers }: Props) {
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFollowedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="p-4 border-slate-200/90 shadow-2xs">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Verified Manufacturers</h2>
        <Link href="/explore" className="text-xs font-semibold text-brand-blue hover:underline">
          View all
        </Link>
      </div>
      <ul className="space-y-3">
        {manufacturers.slice(0, 4).map((manufacturer) => {
          const isFollowing = !!followedMap[manufacturer.id];

          return (
            <li key={manufacturer.id} className="flex items-center gap-2.5">
              <Link
                href={`/manufacturers/${manufacturer.slug}`}
                className="flex items-center gap-2.5 min-w-0 flex-1 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={manufacturer.logoUrl}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-xs font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                    {manufacturer.name.replace(" Pvt. Ltd.", "").replace(" Industries", "")}
                    {manufacturer.verified ? <VerifiedBadge className="h-3 w-3 shrink-0" /> : null}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{manufacturer.country}</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={(e) => toggleFollow(manufacturer.id, e)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all border shadow-2xs",
                  isFollowing
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-blue/40 hover:bg-blue-50/60 hover:text-brand-blue"
                )}
              >
                {isFollowing ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

