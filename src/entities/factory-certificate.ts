export type FactoryCertificate = {
  id: string;
  title: string;
  issuer: string;
  certNumber: string;
  issueDate?: string;
  expiryDate?: string;
  imageUrl: string;
  verified: boolean;
  category?: "Quality" | "Safety & CE" | "Environmental" | "Audit Report" | "Honor";
};
