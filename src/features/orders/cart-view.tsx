"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2, Info } from "lucide-react";
import { getApi } from "@/shared/api";
import type { Cart, CartItem, OrderContact } from "@/entities/order";
import type { BuyerProfile } from "@/entities/user";
import { ShippingForm } from "@/features/orders/shipping-form";
import { PAYMENT_NOTE, formatMoney } from "@/features/orders/order-status";
import { useTranslations } from "next-intl";

type Props = {
  user: BuyerProfile;
  initialCart: Cart;
};

export function CartView({ user, initialCart }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [cart, setCart] = useState(initialCart);
  const [busyLine, setBusyLine] = useState<string | null>(null);
  const [lineError, setLineError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Grouped by factory for reading; checkout sends one order request per product
  const groups = useMemo(() => {
    const byFactory = new Map<string, CartItem[]>();
    for (const item of cart.items) {
      byFactory.set(item.manufacturer.id, [...(byFactory.get(item.manufacturer.id) ?? []), item]);
    }
    return [...byFactory.values()];
  }, [cart.items]);

  const run = async (lineId: string, action: () => Promise<Cart>) => {
    setBusyLine(lineId);
    setLineError(null);
    try {
      setCart(await action());
    } catch (err) {
      setLineError(err instanceof Error ? err.message : t("orders.cart.couldNotUpdateYourCart"));
    } finally {
      setBusyLine(null);
    }
  };

  const placeOrder = async (contact: OrderContact) => {
    setPlacing(true);
    setCheckoutError(null);
    try {
      const orders = await getApi().orders.checkout(contact);
      router.push(`/orders?placed=${encodeURIComponent(orders.map((o) => o.referenceNumber).join(","))}`);
      router.refresh();
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : t("orders.cart.couldNotSendYourOrder"));
      setPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center space-y-3 shadow-2xs">
        <ShoppingCart className="mx-auto h-8 w-8 text-ink-faint" />
        <p className="text-sm font-bold text-ink">{t("orders.cart.yourCartIsEmpty")}</p>
        <p className="text-xs text-ink-muted">{t("orders.cart.addProductsFromAFactory")}</p>
        <Link
          href="/explore"
          className="inline-flex h-9 items-center rounded-full bg-brand-blue px-5 text-xs font-bold text-white hover:bg-brand-blue-dark"
        >
          {t("orders.exploreProducts")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
      <div className="space-y-4 min-w-0">
        {lineError && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
            {lineError}
          </p>
        )}

        {groups.map((items) => (
          <section key={items[0].manufacturer.id} className="rounded-2xl border border-line bg-white shadow-2xs overflow-hidden">
            <header className="flex items-center justify-between gap-3 border-b border-line bg-canvas/60 px-4 py-2.5">
              <Link
                href={`/manufacturers/${items[0].manufacturer.slug}`}
                className="text-xs font-bold text-ink hover:text-brand-blue truncate"
              >
                {items[0].manufacturer.name}
              </Link>
              <span className="text-[11px] text-ink-muted shrink-0">{t("orders.cart.sentToThisFactory")}</span>
            </header>

            <ul className="divide-y divide-line">
              {items.map((item) => {
                const busy = busyLine === item.id;
                return (
                  <li key={item.id} className="flex gap-3 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-20 w-20 shrink-0 rounded-xl border border-line object-cover bg-canvas"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="block text-sm font-bold text-ink hover:text-brand-blue line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-[11px] text-ink-muted">
                        {item.unitPrice != null ? `${formatMoney(item.unitPrice, "INR")} / ${item.product.unit || "unit"}` : t("product.actions.priceOnRequest")}
                        {item.minQuantity > 1 ? ` • MOQ ${item.minQuantity}` : ""}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-lg border border-line">
                          <button
                            type="button"
                            aria-label={t("orders.decreaseQuantity")}
                            disabled={busy || item.quantity <= item.minQuantity}
                            onClick={() => run(item.id, () => getApi().orders.updateCartQuantity(item.id, item.quantity - 1))}
                            className="flex h-8 w-8 items-center justify-center text-ink-muted hover:text-brand-blue disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-10 text-center text-xs font-bold tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={t("orders.increaseQuantity")}
                            disabled={busy}
                            onClick={() => run(item.id, () => getApi().orders.updateCartQuantity(item.id, item.quantity + 1))}
                            className="flex h-8 w-8 items-center justify-center text-ink-muted hover:text-brand-blue disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-ink tabular-nums">
                            {item.lineTotal != null ? formatMoney(item.lineTotal, "INR") : "—"}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove ${item.product.name}`}
                            disabled={busy}
                            onClick={() => run(item.id, () => getApi().orders.removeFromCart(item.id))}
                            className="rounded-lg p-1.5 text-ink-faint hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <aside className="rounded-2xl border border-line bg-white p-5 shadow-2xs space-y-4 lg:sticky lg:top-24">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-ink">{t("orders.estimatedTotal")}</span>
          <span className="text-xl font-extrabold text-ink tabular-nums">{formatMoney(cart.totalAmount, cart.currency)}</span>
        </div>
        <p className="flex gap-2 rounded-lg bg-blue-50/70 px-3 py-2 text-[11px] text-slate-700">
          <Info className="h-3.5 w-3.5 shrink-0 text-brand-blue mt-0.5" />
          <span>
            {cart.items.length > 1 ? t("orders.cart.sendsOrderRequestsOnePer", { length: cart.items.length }) : ""}
            {t(PAYMENT_NOTE)}
          </span>
        </p>
        <ShippingForm
          user={user}
          submitLabel={cart.items.length > 1 ? t("orders.cart.sendOrderRequests") : t("orders.sendOrderRequest")}
          submitting={placing}
          error={checkoutError}
          onSubmit={placeOrder}
        />
      </aside>
    </div>
  );
}
