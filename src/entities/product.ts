/** Orders of at least minQty pay priceInr per unit. */
export type PriceTier = {
  minQty: number;
  priceInr: number;
};

/** Seller-set availability; missing means IN_STOCK. */
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type Product = {
  id: string;
  slug: string;
  manufacturerId: string;
  name: string;
  imageUrl: string;
  description: string;
  priceInr: number;
  unit: string;
  moq: string;
  categoryId: string;
  specs: Record<string, string>;
  /** Gallery in display order; the first image is `imageUrl`. */
  imageUrls?: string[];
  /** Optional PDF datasheet. */
  datasheetUrl?: string;
  datasheetName?: string;
  /** false = paused by the seller (only seller views ever receive paused items). */
  listed?: boolean;
  /** Seller-set availability; treat undefined as IN_STOCK. */
  stockStatus?: StockStatus;
  /** Bulk price breaks set by the factory, ascending by minQty; empty when none. */
  priceTiers?: PriceTier[];
  /** Signed-in viewer's own state; undefined for guests. */
  savedByMe?: boolean;
  /** Persisted product engagement, supplied by the product API (never seek IDs). */
  likesCount?: number;
  likedByMe?: boolean;
};
