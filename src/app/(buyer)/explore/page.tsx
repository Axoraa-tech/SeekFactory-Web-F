import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { PageHeader } from "@/components/ui/page-header";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { Category } from "@/entities/category";
import { getApi } from "@/shared/api";
import { formatCount, formatPriceInr } from "@/shared/lib/format";

type Props = {
  searchParams: Promise<{ q?: string; category?: string; sub?: string }>;
};

export default async function ExplorePage({ searchParams }: Props) {
  const { q = "", category = "all", sub = "" } = await searchParams;
  const api = getApi();
  const [roots, allCategories, manufacturers, products] = await Promise.all([
    api.categories.listRoots(),
    api.categories.list(),
    api.manufacturers.listAll(),
    api.products.listTrending(12),
  ]);

  const selectedRoot = roots.find((item) => item.slug === category) ?? null;
  const children = selectedRoot ? await api.categories.listChildren(selectedRoot.id) : [];
  const selectedSub = children.find((item) => item.slug === sub) ?? null;
  const selected = selectedSub ?? selectedRoot;
  const query = q.trim().toLowerCase();

  const visibleManufacturers = manufacturers.filter((item) => {
    const matchesQuery = !query || item.name.toLowerCase().includes(query);
    return matchesQuery && matchesAssigned(item.categoryIds, selected, allCategories);
  });

  const visibleProducts = products.filter((item) => {
    const matchesQuery = !query || item.name.toLowerCase().includes(query);
    return matchesQuery && matchesAssigned([item.categoryId], selected, allCategories);
  });

  return (
    <section>
      <PageHeader
        title="Explore"
        description="Browse machinery categories and verified factories."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Chip href="/explore" active={!selectedRoot}>
          All
        </Chip>
        {roots.map((item) => (
          <Chip
            key={item.id}
            href={`/explore?category=${item.slug}`}
            active={selectedRoot?.id === item.id}
          >
            {item.name}
          </Chip>
        ))}
      </div>

      {selectedRoot ? (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-faint">
            {selectedRoot.name} subcategories
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {children.map((child) => {
              const href = `/explore?category=${selectedRoot.slug}&sub=${child.slug}`;
              const active = selectedSub?.id === child.id;
              return (
                <Link
                  key={child.id}
                  href={href}
                  className={
                    active
                      ? "flex items-center gap-2 rounded-card border border-brand-blue bg-brand-blue-soft px-3 py-2 text-sm font-semibold text-brand-blue"
                      : "flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2 text-sm hover:border-brand-blue/40"
                  }
                >
                  <CategoryIcon icon={child.icon} className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{child.name}</span>
                  <span className="text-xs text-ink-faint">{formatCount(child.listingCount)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-faint">Manufacturers</h2>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {visibleManufacturers.map((manufacturer) => (
          <Link key={manufacturer.id} href={`/manufacturers/${manufacturer.slug}`}>
            <Card className="flex gap-3 p-3 hover:border-brand-blue/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={manufacturer.logoUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div>
                <p className="flex items-center gap-1 font-semibold">
                  {manufacturer.name}
                  {manufacturer.verified ? <VerifiedBadge /> : null}
                </p>
                <p className="text-xs text-ink-muted">
                  {manufacturer.location} · {manufacturer.country}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-faint">Products</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {visibleProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <Card className="overflow-hidden hover:border-brand-blue/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.imageUrl} alt={product.name} className="h-36 w-full object-cover" />
              <div className="p-3">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm font-bold text-brand-blue">
                  {formatPriceInr(product.priceInr)} / {product.unit}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {visibleManufacturers.length === 0 && visibleProducts.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">No matches for this search.</p>
      ) : null}

      {!selectedRoot ? (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {roots.map((item) => (
            <Link
              key={item.id}
              href={`/explore?category=${item.slug}`}
              className="flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2 text-sm"
            >
              <CategoryIcon icon={item.icon} className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <span className="ml-auto text-xs text-ink-faint">{formatCount(item.listingCount)}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function matchesAssigned(
  assignedIds: string[],
  selected: Category | null,
  all: Category[],
): boolean {
  if (!selected) return true;
  if (assignedIds.includes(selected.id)) return true;
  if (selected.parentId === null) {
    const childIds = all.filter((item) => item.parentId === selected.id).map((item) => item.id);
    return assignedIds.some((id) => childIds.includes(id));
  }
  return false;
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold text-white"
          : "rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink-muted"
      }
    >
      {children}
    </Link>
  );
}
