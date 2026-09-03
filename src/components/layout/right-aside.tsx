import { VerifiedManufacturers } from "@/components/widgets/verified-manufacturers";
import { TrendingProducts } from "@/components/widgets/trending-products";
import { RecentMessages } from "@/components/widgets/recent-messages";
import { ExploreByCategory } from "@/components/widgets/explore-by-category";
import type { Category } from "@/entities/category";
import type { Manufacturer } from "@/entities/manufacturer";
import type { Product } from "@/entities/product";
import type { Conversation } from "@/entities/message";

type Props = {
  manufacturers: Manufacturer[];
  products: Product[];
  messages: (Conversation & { manufacturer: Manufacturer })[];
  categories: Category[];
};

export function RightAside({ manufacturers, products, messages, categories }: Props) {
  return (
    <aside className="hidden w-[300px] shrink-0 xl:block">
      <div className="sticky top-[88px] h-[calc(100vh-104px)] overflow-y-auto space-y-4 pr-1">
        <VerifiedManufacturers manufacturers={manufacturers} />
        <TrendingProducts products={products} />
        <RecentMessages messages={messages} />
        <ExploreByCategory categories={categories} />
      </div>
    </aside>
  );
}

