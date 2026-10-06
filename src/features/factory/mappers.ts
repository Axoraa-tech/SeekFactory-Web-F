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
    imageUrls: product.imageUrls?.length ? product.imageUrls : [product.imageUrl],
    datasheetUrl: product.datasheetUrl,
    datasheetName: product.datasheetName,
    category: categoryName(categories, product.categoryId, "Industrial Machinery"),
    categoryId: product.categoryId,
    priceInr: product.priceInr,
    unit: product.unit,
    moq: product.moq,
    status: product.listed === false ? "Paused" : "Active",
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
    status: reel.listed === false ? "Paused" : reel.videoUrl ? "Published" : "Processing",
    description: reel.description,
    hashtags: reel.hashtags,
    productIds: reel.productIds,
  };
}

/** RFQ lifecycle statuses after which the buyer no longer accepts quotes. */
const CLOSED_RFQ_STATUSES = new Set(["ACCEPTED", "IN_PRODUCTION", "COMPLETED", "CANCELLED"]);

/**
 * Seller-facing status: RFQs are broadcast to many factories, so "Quoted" means
 * *this* factory has quoted (the backend sends its own quote), not that anyone did.
 */
export function sellerRfqStatus(rfq: RfqItem): SellerRfq["status"] {
  if (CLOSED_RFQ_STATUSES.has(rfq.status.toUpperCase())) return "Closed";
  return rfq.quotedPriceInr !== undefined && rfq.quotedPriceInr !== null ? "Quoted" : "New";
}

export function toSellerRfq(rfq: RfqItem, categories: Category[] = []): SellerRfq {
  const budget = Number(rfq.targetPrice);
  const createdAt = new Date(rfq.createdAt);
  // Older RFQs embed the category as a "[Name] ..." prefix in the details
  const legacyCategory = /^\[([^\]]+)\]/.exec(rfq.details ?? "")?.[1];
  return {
    id: rfq.id,
    referenceNumber: rfq.referenceNumber,
    buyerName: rfq.buyerName || rfq.companyName || "Buyer",
    buyerCompany: rfq.companyName || rfq.buyerName || "Buyer",
    buyerCountry: rfq.buyerCountry || "",
    buyerAvatarUrl: rfq.buyerAvatarUrl,
    productName: rfq.productName,
    productCategory: categoryName(categories, rfq.categoryId, legacyCategory || "Machinery"),
    quantityRequested: [rfq.quantity, rfq.unit].filter(Boolean).join(" ") || "—",
    targetBudgetInr: rfq.targetPrice && Number.isFinite(budget) ? budget : undefined,
    deliveryPort: rfq.incoterm || "—",
    status: sellerRfqStatus(rfq),
    createdAt: Number.isNaN(createdAt.getTime()) ? rfq.createdAt : createdAt.toLocaleDateString("en-IN"),
    requirements: rfq.details || "",
    quotedPriceInr: rfq.quotedPriceInr,
    leadTimeDays: rfq.leadTimeDays,
    quoteIncoterm: rfq.quoteIncoterm,
    quoteNotes: rfq.quoteNotes,
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
    certifications: manufacturer?.certifications?.length
      ? manufacturer.certifications
      : certificates.map((cert) => cert.title),
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
    exportCountries: profile.exportCountries,
  };
  // Partial saves (e.g. certificates only) must not blank out other fields.
  return Object.fromEntries(
    Object.entries(update).filter(([, value]) => value !== undefined),
  ) as Partial<Manufacturer>;
}
