"use server";

import { revalidatePath } from "next/cache";
import { getApi } from "@/shared/api";
import type { NewOrderRequest, OrderRequest } from "@/entities/order";

export type PlaceOrderResult =
  | { ok: true; data: OrderRequest }
  | { ok: false; error: string; needsLogin?: boolean };

/**
 * Buyer places an order request. Runs on the server so mock mode writes to the same
 * fixtures /factory reads and HTTP mode forwards the HttpOnly session cookie.
 * No payment is taken: the factory is notified and follows up with the buyer.
 */
export async function placeOrderAction(input: NewOrderRequest): Promise<PlaceOrderResult> {
  const user = await getApi().session.getCurrentUser();
  if (!user) {
    return { ok: false, error: "Sign in to send an order request.", needsLogin: true };
  }

  const quantity = Number(input.quantity);
  if (!input.productSlug) return { ok: false, error: "Product is missing." };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1_000_000) {
    return { ok: false, error: "Enter a whole quantity between 1 and 1,000,000." };
  }
  if (input.note && input.note.length > 2000) {
    return { ok: false, error: "Note must be at most 2000 characters." };
  }

  try {
    const order = await getApi().orders.place({
      productSlug: input.productSlug,
      quantity,
      note: input.note?.trim() || undefined,
    });
    revalidatePath("/orders");
    revalidatePath("/factory");
    return { ok: true, data: order };
  } catch (err) {
    console.error("Order request failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not send the order request." };
  }
}
