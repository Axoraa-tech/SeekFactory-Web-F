import { requireUser } from "@/features/auth/require-user";
import { CartView } from "@/features/orders/cart-view";
import { getApi } from "@/shared/api";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.cart.title") };
}

export default async function CartPage() {
  const t = await getTranslations();
  const user = await requireUser("/cart");
  const cart = await getApi().orders.getCart();

  return (
    <section className="w-full space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("userMenu.cart")}</h1>
      <CartView user={user} initialCart={cart} />
    </section>
  );
}
