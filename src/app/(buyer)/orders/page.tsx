import { requireUser } from "@/features/auth/require-user";
import { OrdersList } from "@/features/orders/orders-list";
import { getApi } from "@/shared/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Orders | SeekFactory",
};

type Props = {
  searchParams: Promise<{ placed?: string }>;
};

export default async function OrdersPage({ searchParams }: Props) {
  const { placed = "" } = await searchParams;
  await requireUser("/orders");
  const orders = await getApi().orders.listMine();

  return (
    <section className="w-full space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Orders</h1>
      <OrdersList initialOrders={orders} placed={placed ? placed.split(",").filter(Boolean) : []} />
    </section>
  );
}
