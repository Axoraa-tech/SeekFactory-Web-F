"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import type { Category } from "@/entities/category";
import { useRegionalSettings } from "@/shared/i18n/regional-context";

type Props = {
  categories: Category[];
};

export function ExploreByCategory({ categories }: Props) {
  const { t, translateCategory } = useRegionalSettings();
  const shown = categories.slice(0, 5);

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-bold">{t("widgets.exploreByCategory", "Explore by Category")}</h2>
      {/* Two per row: category names are long ("Aircraft & Ground Support Equipment") */}
      <div className="grid grid-cols-2 gap-2">
        {shown.map((category) => (
          <Link
            key={category.id}
            href={`/explore?category=${category.slug}`}
            title={translateCategory(category.name)}
            className="sf-btn-nav flex min-w-0 flex-col items-center gap-1.5 rounded-xl border border-line px-1.5 py-2.5 text-center hover:bg-canvas"
          >
            <CategoryIcon icon={category.icon} className="h-5 w-5 shrink-0 text-ink-muted" />
            <span className="line-clamp-2 w-full break-words text-[11px] font-medium leading-tight [hyphens:auto]">
              {translateCategory(category.name)}
            </span>
          </Link>
        ))}
        <Link
          href="/explore"
          className="sf-btn-nav flex flex-col items-center justify-center rounded-xl border border-line px-2 py-3 text-center text-xs font-semibold text-brand-orange hover:bg-canvas hover:border-brand-orange/40 transition-colors"
        >
          {t("widgets.viewAll", "More")}
        </Link>
      </div>
    </Card>
  );
}
