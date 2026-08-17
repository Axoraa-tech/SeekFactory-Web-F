export type Manufacturer = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  coverUrl: string;
  country: string;
  location: string;
  verified: boolean;
  premium: boolean;
  yearsEstablished: number;
  factorySize: string;
  employees: string;
  exportCountries: string[];
  description: string;
  followerCount: number;
  categoryIds: string[];
  chairmanName?: string;
};
