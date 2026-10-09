"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { getApi } from "@/shared/api";
import type { Category } from "@/entities/category";
import type { NewFactoryProduct, NewFactorySeek } from "@/shared/api/contracts";
import { createProductAction, createSeekAction } from "../actions";
import { AddProductModal } from "../components/add-product-modal";
import { SeekComposerModal, type LinkableProduct } from "./seek-composer-modal";
import { OPEN_COMPOSER_EVENT, type ComposerMode } from "./events";


type Props = {
  author: { name: string; avatarUrl: string };
  categories: Category[];
};

/** LinkedIn-style "Start a post" card on the marketplace feed (manufacturers only). */
export function FeedPostComposer({ author, categories }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [seekOpen, setSeekOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [products, setProducts] = useState<LinkableProduct[] | null>(null);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  const loadProducts = useCallback(() => {
    if (products) return;
    getApi()
      .factory.getProducts()
      .then((list) => setProducts(list.map((p) => ({ id: p.id, name: p.name, imageUrl: p.imageUrl }))))
      .catch(() => setProducts([]));
  }, [products]);

  const open = useCallback(
    (mode: ComposerMode) => {
      if (mode === "seek") {
        loadProducts();
        setSeekOpen(true);
      } else {
        setProductOpen(true);
      }
    },
    [loadProducts],
  );

  useEffect(() => {
    const onOpen = (e: Event) => open(((e as CustomEvent).detail as ComposerMode) ?? "seek");
    window.addEventListener(OPEN_COMPOSER_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_COMPOSER_EVENT, onOpen);
  }, [open]);

  async function publishSeek(seek: NewFactorySeek) {
    const result = await createSeekAction(seek);
    if (!result.ok) throw new Error(result.error);
    router.refresh();
  }

  async function createProduct(input: NewFactoryProduct) {
    const result = await createProductAction(input);
    if (!result.ok) throw new Error(result.error);
    const created = result.data;
    setProducts((prev) => [{ id: created.id, name: created.name, imageUrl: created.imageUrl }, ...(prev ?? [])]);
    // Opened from the seek composer: link the new product there
    if (seekOpen) setCreatedProductId(created.id);
    else router.refresh();
  }

  return (
    <>
      <div data-post-composer className="rounded-2xl border border-line bg-surface p-3 sm:p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <Avatar src={author.avatarUrl} alt={author.name} size={44} className="shrink-0" />
          <button
            type="button"
            onClick={() => open("seek")}
            className="flex h-11 flex-1 items-center rounded-full border border-slate-300 px-4 text-left text-sm font-semibold text-ink-muted transition hover:bg-canvas"
          >
            {t("seller.composer.startAPost")}
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2">
          <button
            type="button"
            onClick={() => open("seek")}
            className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-ink-muted transition hover:bg-canvas"
          >
            <Video className="h-5 w-5 text-emerald-600" />
            {t("seller.composer.video")}
          </button>
          <button
            type="button"
            onClick={() => open("product")}
            className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-ink-muted transition hover:bg-canvas"
          >
            <ImageIcon className="h-5 w-5 text-brand-blue" />
            {t("seller.composer.photo")}
          </button>
        </div>
      </div>

      {seekOpen && (
        <SeekComposerModal
          author={author}
          products={products ?? []}
          categories={categories}
          onClose={() => {
            setSeekOpen(false);
            setCreatedProductId(null);
          }}
          onPublish={publishSeek}
          onCreateProduct={() => setProductOpen(true)}
          newlyCreatedProductId={createdProductId}
          suspended={productOpen}
        />
      )}

      {productOpen && (
        <AddProductModal isOpen categories={categories} onClose={() => setProductOpen(false)} onSubmit={createProduct} />
      )}
    </>
  );
}
