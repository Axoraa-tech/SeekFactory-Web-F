"use server";

import { revalidatePath } from "next/cache";
import { getApi } from "@/shared/api";
import type {
  FactoryProductUpdate,
  FactoryQuote,
  FactorySeekUpdate,
  FactoryVerification,
  NewFactoryProduct,
  NewFactorySeek,
  VerificationSubmission,
} from "@/shared/api/contracts";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { Reel } from "@/entities/reel";
import type { OrderRequest, OrderStatus } from "@/entities/order";
import { ORDER_STATUSES } from "@/features/orders/order-status";

/**
 * Seller hub mutations. Run on the server so that:
 * - mock mode writes to the same fixtures the buyer pages read (/, /explore, /products/*),
 * - HTTP mode forwards the HttpOnly sf-access-token cookie to the backend,
 * - every buyer-facing route is revalidated after a change.
 *
 * Errors come back as values: Next.js masks thrown messages from server actions in production.
 */
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(mutate: () => Promise<T>): Promise<ActionResult<T>> {
  // Mock mode: role comes from the client-writable demo cookie (see AGENTS.md §7).
  // HTTP mode: the backend is the real authority; this is an early, friendlier rejection.
  const user = await getApi().session.getCurrentUser();
  if (user?.role !== "Supplier") {
    return { ok: false, error: "Sign in with a manufacturer account to manage your factory." };
  }

  try {
    const data = await mutate();
    revalidatePath("/", "layout");
    return { ok: true, data };
  } catch (err) {
    console.error("Factory action failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong. Please retry." };
  }
}

function isUploadableUrl(url: string) {
  // blob:/data: URLs are browser-local and would break for every other viewer.
  return url.startsWith("/") || /^https?:\/\//i.test(url);
}

export async function createProductAction(input: NewFactoryProduct): Promise<ActionResult<Product>> {
  if (!input.name?.trim()) return { ok: false, error: "Product name is required." };
  if (!input.categoryId) return { ok: false, error: "Choose a category." };
  if (!(input.priceInr > 0)) return { ok: false, error: "Price must be greater than zero." };
  if (!isUploadableUrl(input.imageUrl)) return { ok: false, error: "Product photo was not uploaded." };
  return run(() => getApi().factory.addProduct({ ...input, name: input.name.trim() }));
}

export async function updateProductAction(id: string, input: FactoryProductUpdate): Promise<ActionResult<Product>> {
  if (input.name !== undefined && !input.name.trim()) return { ok: false, error: "Product name is required." };
  if (input.priceInr !== undefined && !(input.priceInr > 0)) {
    return { ok: false, error: "Price must be greater than zero." };
  }
  if (input.imageUrls) {
    if (input.imageUrls.length === 0) return { ok: false, error: "Add at least one product photo." };
    if (input.imageUrls.length > 8) return { ok: false, error: "A product can have at most 8 photos." };
    if (!input.imageUrls.every(isUploadableUrl)) return { ok: false, error: "A product photo was not uploaded." };
  }
  if (input.datasheetUrl && !isUploadableUrl(input.datasheetUrl)) {
    return { ok: false, error: "Datasheet was not uploaded." };
  }
  return run(() => getApi().factory.updateProduct(id, { ...input, name: input.name?.trim() }));
}

export async function setProductListedAction(id: string, listed: boolean): Promise<ActionResult<Product>> {
  return run(() => getApi().factory.setProductListed(id, listed));
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  return run(async () => {
    await getApi().factory.deleteProduct(id);
    return undefined;
  });
}

export async function createSeekAction(input: NewFactorySeek): Promise<ActionResult<Reel>> {
  if (!input.title?.trim()) return { ok: false, error: "Video title is required." };
  if (!input.videoUrl || !isUploadableUrl(input.videoUrl)) {
    return { ok: false, error: "Video file was not uploaded." };
  }
  if (!isUploadableUrl(input.posterUrl)) return { ok: false, error: "Cover image was not uploaded." };
  return run(() => getApi().factory.addSeek({ ...input, title: input.title.trim() }));
}

export async function updateSeekAction(id: string, input: FactorySeekUpdate): Promise<ActionResult<Reel>> {
  if (input.title !== undefined && !input.title.trim()) return { ok: false, error: "Video title is required." };
  if (input.posterUrl && !isUploadableUrl(input.posterUrl)) return { ok: false, error: "Cover image was not uploaded." };
  return run(() => getApi().factory.updateSeek(id, { ...input, title: input.title?.trim() }));
}

export async function setSeekListedAction(id: string, listed: boolean): Promise<ActionResult<Reel>> {
  return run(() => getApi().factory.setSeekListed(id, listed));
}

export async function deleteSeekAction(id: string): Promise<ActionResult> {
  return run(async () => {
    await getApi().factory.deleteSeek(id);
    return undefined;
  });
}

export async function submitQuoteAction(rfqId: string, quote: FactoryQuote): Promise<ActionResult> {
  if (!(quote.quotePrice > 0)) return { ok: false, error: "Quotation amount must be greater than zero." };
  if (!(quote.leadTimeDays > 0)) return { ok: false, error: "Lead time must be at least 1 day." };
  return run(async () => {
    await getApi().factory.submitQuote(rfqId, quote);
    return undefined;
  });
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  note?: string,
): Promise<ActionResult<OrderRequest>> {
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: "Unknown order status." };
  if (note && note.length > 2000) return { ok: false, error: "Note must be at most 2000 characters." };
  return run(() => getApi().factory.updateOrderStatus(orderId, status, note?.trim() || undefined));
}

export async function updateFactoryProfileAction(
  data: Partial<Manufacturer>,
): Promise<ActionResult<Manufacturer>> {
  if (data.websiteUrl !== undefined) {
    const website = data.websiteUrl.trim();
    // "example.com" → "https://example.com"; any other scheme (javascript:, data:, …) is refused
    const withScheme = !website || /^https?:\/\//i.test(website) ? website : `https://${website}`;
    if (withScheme && !/^https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(:\d+)?([/?#]\S*)?$/i.test(withScheme)) {
      return { ok: false, error: "Enter a valid website URL, e.g. https://example.com" };
    }
    data = { ...data, websiteUrl: withScheme };
  }
  if (data.certificates?.some((cert) => !isUploadableUrl(cert.imageUrl))) {
    return { ok: false, error: "A certificate image was not uploaded." };
  }
  return run(() => getApi().factory.updateProfile(data));
}

export async function submitVerificationAction(
  input: VerificationSubmission,
): Promise<ActionResult<FactoryVerification>> {
  if (input.companyRegNumber.trim().length < 4) {
    return { ok: false, error: "Enter a valid business registration number." };
  }
  if (input.factoryAddress.trim().length < 10) return { ok: false, error: "Enter the full factory address." };
  return run(() =>
    getApi().factory.submitVerification({
      ...input,
      companyRegNumber: input.companyRegNumber.trim(),
      factoryAddress: input.factoryAddress.trim(),
      taxId: input.taxId?.trim() || undefined,
    }),
  );
}
