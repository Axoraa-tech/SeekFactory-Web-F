import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import type { Category } from "@/entities/category";

type Props = {
  categories: Category[];
};

export function ExploreByCategory({ categories }: Props) {
  const shown = categories.slice(0, 5);
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-bold">Explore by Category</h2>
      <div className="grid grid-cols-3 gap-2">
        {shown.map((category) => (
          <Link
            key={category.id}
            href={`/explore?category=${category.slug}`}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-line px-2 py-3 text-center hover:bg-canvas"
          >
            <CategoryIcon icon={category.icon} className="h-5 w-5 text-ink-muted" />
            <span className="text-[11px] font-medium leading-tight">{category.name}</span>
          </Link>
        ))}
        <Link
          href="/explore"
          className="flex flex-col items-center justify-center rounded-xl border border-line px-2 py-3 text-center text-xs font-semibold text-brand-blue hover:bg-canvas"
        >
          More
        </Link>
      </div>
    </Card>
  );
}
