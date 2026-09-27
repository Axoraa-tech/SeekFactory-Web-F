import { HomeSeeksInteractiveFeed } from "@/features/feed/home-seeks-interactive-feed";
import { loadFeed, parseFeedTab } from "@/features/feed/load-feed";
import { loadShowcase } from "@/features/feed/load-showcase";
import { getApi } from "@/shared/api";
import { buildCategoryTree } from "@/features/categories/category-tree";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    tab?: string;
    view?: string;
    category?: string;
    sub?: string;
    q?: string;
    layout?: string;
  }>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const tab = parseFeedTab(params.tab);
  const viewMode: "landscape" | "vertical" = params.view === "vertical" ? "vertical" : "landscape";
  const category = params.category || "";
  const sub = params.sub || "";
  const q = params.q || "";

  const [allCategories, showcase] = await Promise.all([getApi().categories.list(), loadShowcase(params.layout)]);
  const { roots, childrenByRoot } = buildCategoryTree(allCategories);
  const subcategoryId = sub ? allCategories.find((c) => c.slug === sub)?.id ?? "" : "";
  const items = await loadFeed(tab, subcategoryId, q);

  return (
    <HomeSeeksInteractiveFeed
      initialItems={items}
      roots={roots}
      allCategories={allCategories}
      childrenByRoot={childrenByRoot}
      initialTab={tab}
      initialViewMode={viewMode}
      initialCategorySlug={category}
      initialSubcategorySlug={sub}
      initialQuery={q}
      showcase={showcase}
    />
  );
}
