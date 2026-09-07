export type ProfileTab = "details" | "rfqs" | "saved" | "following" | "premium";

export type MembershipTier = "free" | "pro" | "enterprise";

export type ProfileFormData = {
  name: string;
  email: string;
  companyName: string;
  industry: string;
  country: string;
  phone: string;
  taxId: string;
  address: string;
};

export type ProfileRfq = {
  id: string;
  title: string;
  category: string;
  targetQty: string;
  targetPrice: string;
  status: string;
  statusColor: string;
  date: string;
};
