import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { getApi } from "@/shared/api";
import { formatPriceInr } from "@/shared/lib/format";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const detail = await getApi().manufacturers.getBySlug(slug);
  return {
    title: detail?.manufacturer.name ?? "Manufacturer",
    description: detail?.manufacturer.description,
  };
}

export default async function ManufacturerPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getApi().manufacturers.getBySlug(slug);
  if (!detail) notFound();
  const { manufacturer, products, reels } = detail;

  return (
    <section className="space-y-4">
      <Card className="overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={manufacturer.coverUrl} alt="" className="h-44 w-full object-cover" />
        <div className="flex flex-wrap items-end gap-4 p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={manufacturer.logoUrl}
            alt=""
            className="-mt-12 h-20 w-20 rounded-xl border-4 border-white object-cover"
          />
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold">
              {manufacturer.name}
              {manufacturer.verified ? <VerifiedBadge className="h-5 w-5" /> : null}
              {manufacturer.premium ? (
                <span className="rounded-md bg-brand-orange-soft px-2 py-0.5 text-xs font-bold text-brand-orange">
                  Premium
                </span>
              ) : null}
            </h1>
            <p className="text-sm text-ink-muted">
              {manufacturer.location} · {manufacturer.country} · Est. {manufacturer.yearsEstablished}
            </p>
          </div>
          <Link href="/messages">
            <Button>Contact supplier</Button>
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 text-sm md:col-span-2">
          <h2 className="font-bold">Factory profile</h2>
          <p className="mt-2 text-ink-muted">{manufacturer.description}</p>
          {manufacturer.chairmanName ? (
            <p className="mt-3 text-sm">
              Chairman: <strong>{manufacturer.chairmanName}</strong>
            </p>
          ) : null}
        </Card>
        <Card className="space-y-2 p-4 text-sm">
          <Row label="Size" value={manufacturer.factorySize} />
          <Row label="Employees" value={manufacturer.employees} />
          <Row label="Export" value={manufacturer.exportCountries.join(", ")} />
        </Card>
      </div>

      {reels[0] ? (
        <Card className="overflow-hidden">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={reels[0].posterUrl} alt={reels[0].title} className="h-56 w-full object-cover" />
            <div className="absolute inset-0 bg-black/35" />
            <p className="absolute bottom-4 left-4 text-lg font-bold text-white">{reels[0].title}</p>
          </div>
        </Card>
      ) : null}

      <h2 className="text-lg font-bold">Products</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <Card className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover" />
              <div className="p-3">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm font-bold text-brand-blue">
                  {formatPriceInr(product.priceInr)} / {product.unit}
                </p>
                <p className="text-xs text-ink-muted">MOQ {product.moq}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="text-ink-faint">{label}</span>
      <br />
      <strong>{value}</strong>
    </p>
  );
}
