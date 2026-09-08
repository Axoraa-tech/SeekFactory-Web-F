"use client";

import Link from "next/link";
import { Bookmark, Trash2, ShoppingCart, Zap } from "lucide-react";
import { formatPriceInr } from "@/shared/lib/format";
import type { Product } from "@/entities/product";

type Props = {
  savedProducts: Product[];
  onRemoveSaved: (productId: string, e: React.MouseEvent) => void;
};

export function ProfileSavedPanel({ savedProducts, onRemoveSaved }: Props) {
  return (
    <div className="space-y-4 glass-fade-in">
      <div className="glass-panel-liquid p-4 sm:p-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">Saved Machines & Industrial Parts</h2>
          <p className="text-xs text-ink-muted">
            Quickly re-order or initiate instant checkout from your bookmarked items
          </p>
        </div>
        <span className="text-xs font-semibold text-ink-muted shrink-0">
          {savedProducts.length} items
        </span>
      </div>

      {savedProducts.length === 0 ? (
        <div className="glass-panel-liquid p-12 text-center space-y-2">
          <Bookmark className="h-8 w-8 mx-auto text-ink-faint" />
          <p className="font-bold text-sm text-ink">No saved products yet</p>
          <p className="text-xs text-ink-muted">
            Explore machinery and click the bookmark button to save items here.
          </p>
          <Link
            href="/explore"
            className="inline-block mt-2 rounded-full bg-brand-blue px-4 py-1.5 text-xs font-bold text-white"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {savedProducts.map((p) => (
            <div
              key={p.id}
              className="glass-panel-liquid p-4 flex flex-col justify-between gap-3 transition hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-20 w-20 rounded-xl object-cover border border-white/80 shrink-0 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${p.slug}`}
                    className="font-bold text-xs sm:text-sm text-ink hover:text-brand-blue transition-colors line-clamp-1"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{p.description}</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-sm sm:text-base font-extrabold text-ink">
                      {formatPriceInr(p.priceInr)}
                    </span>
                    <span className="text-[11px] text-ink-faint">/{p.unit}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => onRemoveSaved(p.id, e)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-faint hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Remove</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/products/${p.slug}`}
                    className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    <span>Order</span>
                  </Link>
                  <Link
                    href={`/products/${p.slug}?action=checkout`}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-blue px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                  >
                    <Zap className="h-3 w-3 fill-white/80" />
                    <span>Buy Now</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
