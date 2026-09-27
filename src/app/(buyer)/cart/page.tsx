import { requireUser } from "@/features/auth/require-user";
import { CartView } from "@/features/orders/cart-view";
import { getApi } from "@/shared/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cart | SeekFactory",
};

export default async function CartPage() {
  const user = await requireUser("/cart");
  const cart = await getApi().orders.getCart();

  return (
    <section className="w-full space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Cart</h1>
      <CartView user={user} initialCart={cart} />
    </section>
  );
}
