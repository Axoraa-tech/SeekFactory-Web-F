"use client";

import Link from "next/link";
import { Bookmark, Trash2, ShoppingCart, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatPriceInr } from "@/shared/lib/format";
import type { Product } from "@/entities/product";

type Props = {
  savedProducts: Product[];
  onRemoveSaved: (productId: string, e: React.MouseEvent) => void;
};

export function ProfileSavedPanel({ savedProducts, onRemoveSaved }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Saved Machines & Industrial Parts</h2>
          <p className="text-xs text-slate-500">
            Quickly re-order or initiate instant checkout from your bookmarked items
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">{savedProducts.length} items</span>
      </div>

      {savedProducts.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 space-y-2">
          <Bookmark className="h-8 w-8 mx-auto text-slate-300" />
          <p className="font-bold text-sm text-slate-700">No saved products yet</p>
          <p className="text-xs text-slate-500">
            Explore machinery and click the bookmark button to save items here.
          </p>
          <Link
            href="/explore"
            className="inline-block mt-2 rounded-xl bg-brand-blue px-4 py-1.5 text-xs font-bold text-white"
          >
            Explore Catalog
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {savedProducts.map((p) => (
            <Card
              key={p.id}
              className="p-4 border-slate-200/90 shadow-2xs flex flex-col justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-20 w-20 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${p.slug}`}
                    className="font-bold text-xs sm:text-sm text-slate-900 hover:text-brand-blue transition-colors line-clamp-1"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900">
                      {formatPriceInr(p.priceInr)}
                    </span>
                    <span className="text-[11px] text-slate-400">/{p.unit}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => onRemoveSaved(p.id, e)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Remove</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/products/${p.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-2xs"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    <span>Order</span>
                  </Link>
                  <Link
                    href={`/products/${p.slug}?action=checkout`}
                    className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs"
                  >
                    <Zap className="h-3 w-3 fill-white/80" />
                    <span>Buy Now</span>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
