import { requireUser } from "@/features/auth/require-user";
import { OrdersList } from "@/features/orders/orders-list";
import { getApi } from "@/shared/api";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.orders.title") };
}

type Props = {
  searchParams: Promise<{ placed?: string }>;
};

export default async function OrdersPage({ searchParams }: Props) {
  const t = await getTranslations();
  const { placed = "" } = await searchParams;
  await requireUser("/orders");
  const orders = await getApi().orders.listMine();

  return (
    <section className="w-full space-y-4">
      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">{t("userMenu.myOrders")}</h1>
      <OrdersList initialOrders={orders} placed={placed ? placed.split(",").filter(Boolean) : []} />
    </section>
  );
}
