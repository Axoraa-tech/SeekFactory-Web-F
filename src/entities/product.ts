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
};
