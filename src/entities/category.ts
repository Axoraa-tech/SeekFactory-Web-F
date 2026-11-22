export type CategoryIconKey =
  | "agriculture"
  | "aircraft"
  | "marine"
  | "construction"
  | "energy"
  | "food"
  | "forestry"
  | "automation"
  | "machine-tools"
  | "material-handling"
  | "mining"
  | "printing"
  | "processing"
  | "semiconductors"
  | "medical"
  | "textile"
  | "transport"
  | "waste"
  | "woodworking"
  | "tool"
  | "flame"
  | "box"
  | "layers"
  | "cpu"
  | "zap"
  | "other";

export type Category = {
  id: string;
  slug: string;
  name: string;
  listingCount: number;
  parentId: string | null;
  icon: CategoryIconKey;
  /** Admin-chosen position among siblings (0 = first); null/absent follows, A-Z. */
  displayOrder?: number | null;
  subcategories?: Category[];
};
