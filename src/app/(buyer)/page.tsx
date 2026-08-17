import { FeedTabs } from "@/components/reels/feed-tabs";
import { ReelsFeed } from "@/components/reels/reels-feed";
import { loadFeed, parseFeedTab } from "@/features/feed/load-feed";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const tab = parseFeedTab(params.tab);
  const items = await loadFeed(tab);

  return (
    <section>
      <FeedTabs tab={tab} />
      <ReelsFeed items={items} />
    </section>
  );
}
