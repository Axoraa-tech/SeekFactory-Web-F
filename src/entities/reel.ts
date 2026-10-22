/** Seek reactions: thumbs up, heart, star. */
export type ReelReaction = "LIKE" | "LOVE" | "STAR";

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
  categoryIds?: string[];
  /** Signed-in viewer's own state; undefined for guests. */
  likedByMe?: boolean;
  /** The viewer's reaction on this seek, if any. */
  myReaction?: ReelReaction;
  savedByMe?: boolean;
  subcategoryIds?: string[];
  /** false = paused by the seller (hidden from the feed). */
  listed?: boolean;
};
