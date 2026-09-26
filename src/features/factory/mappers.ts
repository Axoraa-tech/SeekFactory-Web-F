import type { Category } from "@/entities/category";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { Reel } from "@/entities/reel";
import type { RfqItem } from "@/entities/rfq";
import type { BuyerProfile } from "@/entities/user";
import type { SellerFactoryProfile, SellerProduct, SellerRfq, SellerSeek } from "./types";

/** Domain entities → seller hub view models. One place, so initial render and refreshes agree. */

export function categoryName(categories: Category[], id: string | undefined, fallback: string) {
  return (id && categories.find((item) => item.id === id)?.name) || fallback;
}

export function toSellerProduct(product: Product, categories: Category[]): SellerProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    category: categoryName(categories, product.categoryId, "Industrial Machinery"),
    categoryId: product.categoryId,
    priceInr: product.priceInr,
    unit: product.unit,
    moq: product.moq,
    status: "Active",
    viewsCount: 0,
    inquiriesCount: 0,
    specs: product.specs,
    description: product.description,
    createdAt: "Recently",
  };
}

export function toSellerSeek(reel: Reel, categories: Category[], products: Product[]): SellerSeek {
  return {
    id: reel.id,
    title: reel.title,
    videoUrl: reel.videoUrl || "",
    thumbnailUrl: reel.posterUrl,
    durationSeconds: reel.durationSec,
    viewsCount: reel.views,
    likesCount: reel.likes,
    commentsCount: reel.comments,
    inquiriesGenerated: reel.saves,
    taggedProductName: products.find((item) => item.id === reel.productIds[0])?.name,
    category: categoryName(categories, reel.categoryIds?.[0], "Factory Production"),
    createdAt: "Recently",
    status: reel.videoUrl ? "Published" : "Processing",
  };
}

const RFQ_STATUS: Record<string, SellerRfq["status"]> = {
  SUBMITTED: "New",
  NEW: "New",
  OPEN: "New",
  QUOTED: "Quoted",
  RESPONDED: "Responded",
  UNDER_REVIEW: "Under Review",
};

export function toSellerRfq(rfq: RfqItem): SellerRfq {
  const status = RFQ_STATUS[rfq.status.toUpperCase().replace(/\s+/g, "_")] ?? "New";
  const budget = Number(rfq.targetPrice);
  const createdAt = new Date(rfq.createdAt);
  return {
    id: rfq.id,
    buyerName: rfq.buyerName || rfq.companyName || "Verified Industrial Buyer",
    buyerCompany: rfq.companyName || "Global Sourcing Ltd",
    buyerCountry: rfq.buyerCountry || "India",
    productName: rfq.productName,
    productCategory: /^\[([^\]]+)\]/.exec(rfq.details ?? "")?.[1] || "Machinery",
    quantityRequested: `${rfq.quantity} ${rfq.unit || "Pieces"}`,
    targetBudgetInr: rfq.targetPrice && Number.isFinite(budget) ? budget : undefined,
    deliveryPort: rfq.incoterm || "FOB",
    status,
    createdAt: Number.isNaN(createdAt.getTime()) ? rfq.createdAt : createdAt.toLocaleDateString("en-IN"),
    requirements: rfq.details || "",
    quotedPriceInr: rfq.quotedPriceInr,
    leadTimeDays: rfq.leadTimeDays,
  };
}

export function toSellerProfile(
  manufacturer: Manufacturer | null | undefined,
  user: BuyerProfile,
  tier = "Verified",
): SellerFactoryProfile {
  const certificates = manufacturer?.certificates ?? [];
  return {
    name: manufacturer?.name || user.companyName || "Verified Factory",
    slug: manufacturer?.slug || "",
    logoUrl: manufacturer?.logoUrl || "https://images.seekfactory.com/logos/default.png",
    coverUrl: manufacturer?.coverUrl || "https://images.seekfactory.com/covers/default.jpg",
    country: manufacturer?.country || user.country || "China",
    location: manufacturer?.location || "",
    yearsEstablished: manufacturer?.yearsEstablished || new Date().getFullYear(),
    factorySize: manufacturer?.factorySize || "",
    employees: manufacturer?.employees || "",
    annualTurnover: manufacturer?.annualTurnover,
    exportCountries: manufacturer?.exportCountries || [],
    certifications: certificates.map((cert) => cert.title),
    certificates,
    description: manufacturer?.description || "",
    productionLines: manufacturer?.productionLines ?? 0,
    verified: manufacturer?.verified ?? false,
    websiteUrl: manufacturer?.websiteUrl,
    tier,
  };
}

/** Seller-editable profile fields → the Manufacturer shape the API persists. */
export function toManufacturerUpdate(profile: Partial<SellerFactoryProfile>): Partial<Manufacturer> {
  const update: Partial<Manufacturer> = {
    name: profile.name,
    location: profile.location,
    websiteUrl: profile.websiteUrl,
    yearsEstablished: profile.yearsEstablished,
    factorySize: profile.factorySize,
    employees: profile.employees,
    annualTurnover: profile.annualTurnover,
    productionLines: profile.productionLines,
    description: profile.description,
    certificates: profile.certificates,
  };
  // Partial saves (e.g. certificates only) must not blank out other fields.
  return Object.fromEntries(
    Object.entries(update).filter(([, value]) => value !== undefined),
  ) as Partial<Manufacturer>;
}
