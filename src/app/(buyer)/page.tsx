import { HomeSeeksInteractiveFeed } from "@/features/feed/home-seeks-interactive-feed";
import { loadFeed, parseFeedTab } from "@/features/feed/load-feed";
import { loadShowcase } from "@/features/feed/load-showcase";
import { getApi } from "@/shared/api";
import { buildCategoryTree } from "@/features/categories/category-tree";
import { FeedPostComposer } from "@/features/factory/post-composer/feed-post-composer";

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

  // Without a subcategory filter the feed does not depend on the categories, so it loads in the
  // same wave. Categories and the user are shared with the layout's requests (see getApi()).
  const api = getApi();
  const unfilteredFeed = sub ? null : loadFeed(tab, "", q);
  const [allCategories, showcase, user] = await Promise.all([
    api.categories.list(),
    loadShowcase(params.layout),
    api.session.getCurrentUser(),
  ]);
  const { roots, childrenByRoot } = buildCategoryTree(allCategories);
  const subcategoryId = sub ? allCategories.find((c) => c.slug === sub)?.id ?? "" : "";
  const items = await (unfilteredFeed ?? loadFeed(tab, subcategoryId, q));

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
      composer={
        user?.role === "Supplier" ? (
          <FeedPostComposer key="post-composer" author={{ name: user.name, avatarUrl: user.avatarUrl }} categories={allCategories} />
        ) : undefined
      }
    />
  );
}
