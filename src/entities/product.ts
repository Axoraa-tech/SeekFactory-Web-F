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
};
