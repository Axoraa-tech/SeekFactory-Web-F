"use server";

import { revalidatePath } from "next/cache";
import { getApi } from "@/shared/api";
import type { FactoryQuote, NewFactoryProduct, NewFactorySeek } from "@/shared/api/contracts";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { Reel } from "@/entities/reel";

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

export async function updateFactoryProfileAction(
  data: Partial<Manufacturer>,
): Promise<ActionResult<Manufacturer>> {
  if (data.websiteUrl && !/^https?:\/\//i.test(data.websiteUrl)) {
    return { ok: false, error: "Website must start with http:// or https://" };
  }
  if (data.certificates?.some((cert) => !isUploadableUrl(cert.imageUrl))) {
    return { ok: false, error: "A certificate image was not uploaded." };
  }
  return run(() => getApi().factory.updateProfile(data));
}
