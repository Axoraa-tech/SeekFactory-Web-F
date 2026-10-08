"use client";

import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { Product } from "@/entities/product";
import { cn } from "@/shared/lib/cn";
import { useRegionalSettings } from "@/shared/i18n/regional-context";

type Props = {
  products: Product[];
};

export function TrendingProducts({ products }: Props) {
  const { t, formatPrice, translateProduct, translateUnit } = useRegionalSettings();
  const [page, setPage] = useState(0);

  if (!products || products.length === 0) return null;

  const currentProduct = products[page] ?? products[0];

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">{t("widgets.trendingProducts", "Trending Products")}</h2>
        <Link href="/explore" className="text-xs font-semibold text-brand-orange hover:text-[#d85b17] hover:underline transition-colors">
          {t("widgets.viewAll", "View all")}
        </Link>
      </div>

      {currentProduct && (
        <Link key={currentProduct.id} href={`/products/${currentProduct.slug}`} className="group block">
          <div className="h-32 sm:h-36 w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 relative">
            <SafeImage
              src={currentProduct.imageUrl}
              alt={translateProduct(currentProduct.name)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="mt-2 space-y-0.5">
            <p className="line-clamp-1 text-xs font-bold text-slate-900 group-hover:text-brand-orange transition-colors">
              {translateProduct(currentProduct.name)}
            </p>
            <p className="text-xs font-extrabold text-brand-orange">
              {formatPrice(currentProduct.priceInr)} / {translateUnit(currentProduct.unit)}
            </p>
          </div>
        </Link>
      )}

      {products.length > 1 ? (
        <div className="mt-3 flex justify-center items-center gap-1.5">
          {products.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={t("widgets.trending.showProductsPage", { index: index + 1 })}
              onClick={() => setPage(index)}
              className={cn(
                "h-1.5 rounded-full transition-all cursor-pointer",
                index === page ? "w-4 bg-brand-orange" : "w-1.5 bg-slate-200 hover:bg-slate-300",
              )}
            />
          ))}
        </div>
      ) : null}
    </Card>
  );
}

