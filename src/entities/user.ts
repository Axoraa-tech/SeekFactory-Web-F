export type BuyerProfile = {
  id: string;
  name: string;
  role: "Buyer" | "Supplier";
  avatarUrl: string;
  companyName: string;
  industry: string;
  country: string;
};
