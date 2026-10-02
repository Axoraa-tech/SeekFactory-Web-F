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
  const pages: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) {
    pages.push(products.slice(i, i + 2));
  }
  const [page, setPage] = useState(0);
  const visible = pages[page] ?? [];

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold">{t("widgets.trendingProducts", "Trending Products")}</h2>
        <Link href="/explore" className="text-xs font-semibold text-brand-blue">
          {t("widgets.viewAll", "View all")}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {visible.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="block">
            <div className="h-24 w-full overflow-hidden rounded-lg">
              <SafeImage
                src={product.imageUrl}
                alt={translateProduct(product.name)}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-snug">{translateProduct(product.name)}</p>
            <p className="mt-0.5 text-xs font-bold text-brand-blue">
              {formatPrice(product.priceInr)} / {translateUnit(product.unit)}
            </p>
          </Link>
        ))}
      </div>
      {pages.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {pages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={t("widgets.trending.showProductsPage", { index: index + 1 })}
              onClick={() => setPage(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === page ? "w-4 bg-brand-blue" : "w-1.5 bg-line",
              )}
            />
          ))}
        </div>
      ) : null}
    </Card>
  );
}

