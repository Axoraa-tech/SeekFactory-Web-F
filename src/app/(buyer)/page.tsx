import { DualVideoShowcase } from "@/components/reels/dual-video-showcase";
import { FeedTabs } from "@/components/reels/feed-tabs";
import { ReelsFeed } from "@/components/reels/reels-feed";
import { DynamicCategoryNav } from "@/features/explore/dynamic-category-nav";
import { loadFeed, parseFeedTab } from "@/features/feed/load-feed";
import { getApi } from "@/shared/api";

type Props = {
  searchParams: Promise<{ tab?: string; view?: string; category?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const tab = parseFeedTab(params.tab);
  const viewMode: "landscape" | "vertical" = params.view === "vertical" ? "vertical" : "landscape";
  const category = params.category || "";

  const api = getApi();
  const [roots, items] = await Promise.all([
    api.categories.listRoots(),
    loadFeed(tab),
  ]);

  return (
    <section className="space-y-3">
      <DynamicCategoryNav
        categories={roots}
        selectedCategorySlug={category}
        forYouHref="/"
        sticky={false}
      />
      <FeedTabs tab={tab} viewMode={viewMode} />
      <DualVideoShowcase />
      <ReelsFeed items={items} viewMode={viewMode} />
    </section>
  );
}


