import { requireUser } from "@/features/auth/require-user";
import { RfqForm, type RfqFormTarget } from "@/features/rfq/rfq-form";
import { getApi } from "@/shared/api";
import { compareCategories } from "@/features/categories/category-tree";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("meta.rfqNew.title") };
}

type Props = {
  searchParams: Promise<{ product?: string; manufacturer?: string; reel?: string; category?: string }>;
};

/**
 * The RFQ form about what the buyer was looking at (see rfqHref): a product fixes factory and
 * product, a factory fixes the factory; without either the buyer picks everything from lists.
 */
export default async function NewRfqPage({ searchParams }: Props) {
  const { product = "", manufacturer = "", reel = "", category = "" } = await searchParams;
  // After signing in, come back to the same prefilled form
  const query = new URLSearchParams(Object.entries({ product, manufacturer, reel, category }).filter(([, value]) => value));
  const user = await requireUser(query.toString() ? `/rfq/new?${query}` : "/rfq/new");
  const api = getApi();
  const [allCategories, productDetail, manufacturerDetail] = await Promise.all([
    api.categories.list(),
    product ? api.products.getBySlug(product).catch(() => null) : Promise.resolve(null),
    // A product already names its factory; only a factory link needs the factory's product list
    !product && manufacturer ? api.manufacturers.getBySlug(manufacturer).catch(() => null) : Promise.resolve(null),
  ]);
  const roots = allCategories.filter((c) => !c.parentId).sort(compareCategories);

  // RFQs are filed under a top-level category; factories in its subcategories receive them too
  const rootOf = (id?: string) => {
    const found = allCategories.find((c) => c.id === id || c.slug === id);
    return found?.parentId ?? found?.id ?? "";
  };

  let target: RfqFormTarget = { kind: "global" };
  if (productDetail) {
    target = { kind: "product", manufacturer: productDetail.manufacturer, product: productDetail.product };
  } else if (manufacturerDetail) {
    target = {
      kind: "manufacturer",
      manufacturer: manufacturerDetail.manufacturer,
      products: manufacturerDetail.products.filter((p) => p.listed !== false),
    };
  }

  return (
    <section className="w-full space-y-4">
      <RfqForm
        target={target}
        // The seek only counts when it is the fixed factory's own (the backend checks it too)
        reelId={target.kind !== "global" ? reel || undefined : undefined}
        categories={roots}
        allCategories={allCategories}
        initialCompanyName={user.companyName}
        initialCategoryId={rootOf(category)}
      />
    </section>
  );
}
