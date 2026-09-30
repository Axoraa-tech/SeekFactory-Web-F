"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Minus, Plus } from "lucide-react";
import { getApi } from "@/shared/api";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { OrderContact } from "@/entities/order";
import type { BuyerProfile } from "@/entities/user";
import { minimumOrderQuantity } from "@/shared/lib/quantity";
import { ShippingForm } from "@/features/orders/shipping-form";
import { PAYMENT_NOTE, formatMoney } from "@/features/orders/order-status";
import { useTranslations } from "next-intl";

type Props = {
  user: BuyerProfile;
  product: Product;
  manufacturer: Manufacturer;
  initialQuantity: number;
};

/** Same rule as the backend: the highest bulk tier the quantity reaches, else the base price. */
function unitPriceFor(product: Product, quantity: number) {
  let price = product.priceInr;
  let bestMin = 0;
  for (const tier of product.priceTiers ?? []) {
    if (tier.minQty <= quantity && tier.minQty >= bestMin) {
      bestMin = tier.minQty;
      price = tier.priceInr;
    }
  }
  return price;
}

/** "Buy Now": order a single product without going through the cart. */
export function DirectCheckout({ user, product, manufacturer, initialQuantity }: Props) {
  const tx = useTranslations();
  const tr = useTranslations();
  const router = useRouter();
  const minQty = minimumOrderQuantity(product.moq);
  const [quantity, setQuantity] = useState(Math.max(minQty, initialQuantity));
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unpriced products are still orderable: the factory quotes the price when it responds
  const unitPrice = unitPriceFor(product, quantity) || null;
  const total = unitPrice !== null ? unitPrice * quantity : null;

  const placeOrder = async (contact: OrderContact) => {
    setPlacing(true);
    setError(null);
    try {
      const order = await getApi().orders.place({ productSlug: product.slug, quantity, ...contact });
      router.push(`/orders?placed=${encodeURIComponent(order.referenceNumber)}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr("orders.checkout.couldNotSendYourOrder"));
      setPlacing(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-2xs space-y-4">
        <div className="flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-28 w-28 shrink-0 rounded-xl border border-line object-cover bg-canvas"
          />
          <div className="min-w-0 space-y-1">
            <Link href={`/products/${product.slug}`} className="block text-base font-bold text-ink hover:text-brand-blue">
              {product.name}
            </Link>
            <Link href={`/manufacturers/${manufacturer.slug}`} className="block text-xs font-semibold text-brand-blue hover:underline">
              {manufacturer.name}
            </Link>
            <p className="text-xs text-ink-muted">
              {unitPrice !== null ? `${formatMoney(unitPrice, "INR")} / ${product.unit || "unit"}` : tr("product.actions.priceOnRequest")}
              {minQty > 1 ? ` • MOQ ${minQty}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-xs font-semibold text-ink-muted">{tr("common.quantity")}</span>
          <div className="inline-flex items-center rounded-lg border border-line">
            <button
              type="button"
              aria-label={tr("orders.decreaseQuantity")}
              disabled={quantity <= minQty}
              onClick={() => setQuantity((q) => Math.max(minQty, q - 1))}
              className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-brand-blue disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              aria-label={tr("common.quantity")}
              type="number"
              min={minQty}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(minQty, Number(e.target.value) || minQty))}
              className="w-16 border-x border-line bg-transparent text-center text-xs font-bold tabular-nums focus:outline-none"
            />
            <button
              type="button"
              aria-label={tr("orders.increaseQuantity")}
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-brand-blue"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {(product.priceTiers?.length ?? 0) > 0 && (
          <p className="text-[11px] text-ink-muted">
            {tr("orders.checkout.bulkPricing")}{" "}
            {product.priceTiers!.map((t) => `${t.minQty}+ at ${formatMoney(t.priceInr, "INR")}`).join(" • ")}
          </p>
        )}
      </section>

      <aside className="rounded-2xl border border-line bg-white p-5 shadow-2xs space-y-4 lg:sticky lg:top-24">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-ink">{tr("orders.estimatedTotal")}</span>
          <span className="text-xl font-extrabold text-ink tabular-nums">{total !== null ? formatMoney(total, "INR") : tr("orders.checkout.onRequest")}</span>
        </div>
        <p className="flex gap-2 rounded-lg bg-blue-50/70 px-3 py-2 text-[11px] text-slate-700">
          <Info className="h-3.5 w-3.5 shrink-0 text-brand-blue mt-0.5" />
          <span>{tr(PAYMENT_NOTE)}</span>
        </p>
        <ShippingForm user={user} submitLabel={tx("orders.sendOrderRequest")} submitting={placing} error={error} onSubmit={placeOrder} />
      </aside>
    </div>
  );
}
