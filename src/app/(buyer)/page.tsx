import { HomeSeeksInteractiveFeed } from "@/features/feed/home-seeks-interactive-feed";
import { loadFeed, parseFeedTab } from "@/features/feed/load-feed";
import { getApi } from "@/shared/api";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    tab?: string;
    view?: string;
    category?: string;
    sub?: string;
    q?: string;
  }>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const tab = parseFeedTab(params.tab);
  const viewMode: "landscape" | "vertical" = params.view === "vertical" ? "vertical" : "landscape";
  const category = params.category || "";
  const sub = params.sub || "";
  const q = params.q || "";

  const api = getApi();
  const [roots, allCategories, items] = await Promise.all([
    api.categories.listRoots(),
    api.categories.list(),
    loadFeed(tab),
  ]);

  // Pre-fetch all children for every root category (same as Explore page)
  const childrenMap: Record<string, typeof allCategories> = {};
  await Promise.all(
    roots.map(async (r) => {
      const children = await api.categories.listChildren(r.id);
      childrenMap[r.id] = children;
      childrenMap[r.slug] = children;
    })
  );

  return (
    <HomeSeeksInteractiveFeed
      initialItems={items}
      roots={roots}
      allCategories={allCategories}
      childrenByRoot={childrenMap}
      initialTab={tab}
      initialViewMode={viewMode}
      initialCategorySlug={category}
      initialSubcategorySlug={sub}
      initialQuery={q}
    />
  );
}
