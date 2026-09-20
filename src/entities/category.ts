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
  | "other";

export type Category = {
  id: string;
  slug: string;
  name: string;
  listingCount: number;
  parentId: string | null;
  icon: CategoryIconKey;
};
