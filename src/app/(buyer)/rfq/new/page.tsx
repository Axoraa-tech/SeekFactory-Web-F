import { requireUser } from "@/features/auth/require-user";
import { RfqForm } from "@/features/rfq/rfq-form";
import { getApi } from "@/shared/api";
import { compareCategories } from "@/features/categories/category-tree";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.rfqNew.title") };
}

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
  const roots = allCategories.filter((c) => !c.parentId).sort(compareCategories);

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
