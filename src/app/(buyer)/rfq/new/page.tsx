import { requireUser } from "@/features/auth/require-user";
import { RfqForm } from "@/features/rfq/rfq-form";
import { getApi } from "@/shared/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Post RFQ | SeekFactory",
};

type Props = {
  searchParams: Promise<{ product?: string; category?: string }>;
};

export default async function NewRfqPage({ searchParams }: Props) {
  const { product = "", category = "" } = await searchParams;
  const user = await requireUser("/rfq/new");
  const api = getApi();
  const [allCategories, detail] = await Promise.all([
    api.categories.list(),
    product ? api.products.getBySlug(product) : Promise.resolve(null),
  ]);
  const roots = allCategories.filter((c) => !c.parentId).sort((a, b) => a.name.localeCompare(b.name));

  // RFQs are filed under a top-level category; factories in its subcategories receive them too
  const rootOf = (id?: string) => {
    const found = allCategories.find((c) => c.id === id || c.slug === id);
    return found?.parentId ?? found?.id ?? "";
  };

  return (
    <section className="w-full space-y-4">
      <RfqForm
        categories={roots}
        initialCompanyName={user.companyName}
        initialProductName={detail?.product.name ?? ""}
        initialCategoryId={rootOf(detail?.product.categoryId ?? category)}
      />
    </section>
  );
}
