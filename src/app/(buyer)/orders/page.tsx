import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/features/auth/require-user";
import { ORDER_STATUS_META } from "@/features/orders/order-status";
import { ProductThumb } from "@/features/orders/product-thumb";
import { getApi } from "@/shared/api";
import { formatPriceInr } from "@/shared/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Orders",
};

function formatDate(iso: string | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Buyer's order requests and the status each factory has set. */
export default async function MyOrdersPage() {
  await requireUser("/orders");
  const orders = await getApi().orders.listMine().catch(() => []);

  return (
    <section className="space-y-4">
      <Card className="p-5">
        <h1 className="text-lg font-bold text-ink">My order requests</h1>
        <p className="mt-1 text-xs text-ink-muted">
          SeekFactory connects you with the factory directly; no payment is taken here. The factory contacts you
          and updates the status below as the deal progresses.
        </p>
      </Card>

      {orders.length === 0 ? (
        <Card className="p-10 text-center">
          <ShoppingBag className="mx-auto mb-2 h-10 w-10 text-neutral-300" />
          <p className="text-sm font-bold text-ink">No order requests yet</p>
          <p className="mt-1 text-xs text-ink-muted">
            Click <strong>Order</strong> on any product to send a request to its factory.
          </p>
          <Link href="/explore" className="mt-4 inline-block text-xs font-bold text-brand-blue hover:underline">
            Explore products →
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const meta = ORDER_STATUS_META[order.status];
            return (
              <Card key={order.id} className="p-4">
                <div className="flex items-start gap-3">
                  <ProductThumb src={order.productImageUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-brand-blue">
                          {order.referenceNumber} • {formatDate(order.createdAt)}
                        </p>
                        {order.productSlug ? (
                          <Link
                            href={`/products/${order.productSlug}`}
                            className="text-sm font-bold text-ink hover:text-brand-blue hover:underline"
                          >
                            {order.productName}
                          </Link>
                        ) : (
                          <p className="text-sm font-bold text-ink">{order.productName}</p>
                        )}
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${meta.className}`}
                        title={meta.hint}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">
                      {order.quantity.toLocaleString("en-IN")} {order.unit}
                      {order.estimatedTotalInr !== undefined && <> • est. {formatPriceInr(order.estimatedTotalInr)}</>}
                      {" • "}
                      {order.manufacturer.slug ? (
                        <Link href={`/manufacturers/${order.manufacturer.slug}`} className="font-semibold text-ink hover:underline">
                          {order.manufacturer.name}
                        </Link>
                      ) : (
                        order.manufacturer.name
                      )}
                    </p>
                    {order.sellerNote && (
                      <p className="mt-2 rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-ink">
                        <span className="font-bold">Factory note:</span> {order.sellerNote}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
