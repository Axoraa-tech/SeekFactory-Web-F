"use client";

import Link from "next/link";
import { MessageSquare, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { Manufacturer } from "@/entities/manufacturer";

type Props = {
  followedSuppliers: Manufacturer[];
  onToggleFollow: (mId: string) => void;
};

export function ProfileFollowingPanel({ followedSuppliers, onToggleFollow }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Verified Partner Facilities</h2>
          <p className="text-xs text-slate-500">
            Direct connections with audited OEM & ODM manufacturing plants
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {followedSuppliers.length} following
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {followedSuppliers.map((m) => (
          <Card
            key={m.id}
            className="p-4 border-slate-200/90 shadow-2xs flex flex-col justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.logoUrl}
                alt={m.name}
                className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{m.name}</p>
                  {m.verified && <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {m.location}, {m.country}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Est. {m.yearsEstablished} • {m.factorySize}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onToggleFollow(m.id)}
                className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
              >
                Unfollow
              </button>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/messages?with=${m.slug}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-brand-blue hover:bg-blue-50 transition-colors"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Chat</span>
                </Link>
                <Link
                  href={`/manufacturers/${m.slug}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-black transition-colors"
                >
                  <span>Visit</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
