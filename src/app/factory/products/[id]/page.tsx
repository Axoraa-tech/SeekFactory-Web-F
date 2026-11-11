import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { loadProductPreview } from "@/features/factory/load-product-preview";
import { SellerPreviewBar } from "@/features/factory/seller-preview-bar";
import { ProductDetailView } from "@/features/products/product-detail-view";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("seller.preview.ownerView"), robots: { index: false, follow: false } };
}

export default async function ProductPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const preview = await loadProductPreview(id);
  if (!preview) notFound();
  const t = await getTranslations();

  return (
    <>
      <SellerPreviewBar ownerPreview />
      <main className="mx-auto max-w-[1440px] space-y-5 px-4 py-5 sm:px-6">
        <div className="space-y-1 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p>{t("seller.preview.privateNotice")}</p>
          {preview.detail.product.listed === false && <p>{t("seller.preview.pausedNotice")}</p>}
          {!preview.detail.manufacturer.verified && <p>{t("seller.preview.unverifiedNotice")}</p>}
        </div>
        <ProductDetailView {...preview} preview />
      </main>
    </>
  );
}
