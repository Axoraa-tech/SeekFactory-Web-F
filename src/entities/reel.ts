export type FeedTab = "for-you" | "following";

export type Reel = {
  id: string;
  manufacturerId: string;
  title: string;
  description: string;
  hashtags: string[];
  posterUrl: string;
  videoUrl?: string;
  durationSec: number;
  startSec: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  tab: FeedTab;
  productIds: string[];
};
