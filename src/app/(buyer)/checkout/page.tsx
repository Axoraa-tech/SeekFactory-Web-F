import { notFound } from "next/navigation";
import { requireUser } from "@/features/auth/require-user";
import { DirectCheckout } from "@/features/orders/direct-checkout";
import { getApi } from "@/shared/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout | SeekFactory",
};

type Props = {
  searchParams: Promise<{ product?: string; qty?: string }>;
};

/** "Buy Now" checkout for a single product: /checkout?product=<slug>&qty=<n> */
export default async function CheckoutPage({ searchParams }: Props) {
  const { product: slug = "", qty = "" } = await searchParams;
  const user = await requireUser(`/checkout?product=${encodeURIComponent(slug)}&qty=${encodeURIComponent(qty)}`);
  const detail = slug ? await getApi().products.getBySlug(slug) : null;
  if (!detail) notFound();

  return (
    <section className="w-full space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Checkout</h1>
      <DirectCheckout
        user={user}
        product={detail.product}
        manufacturer={detail.manufacturer}
        initialQuantity={Number(qty) || 1}
      />
    </section>
  );
}
