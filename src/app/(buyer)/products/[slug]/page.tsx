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
  const detail = await getApi().products.getBySlug(slug);
  return {
    title: detail?.product.name ?? "Product",
    description: detail?.product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getApi().products.getBySlug(slug);
  if (!detail) notFound();
  const { product, manufacturer } = detail;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt={product.name} className="h-80 w-full object-cover" />
      </Card>
      <Card className="p-5">
        <p className="flex items-center gap-1 text-xs text-ink-muted">
          <Link href={`/manufacturers/${manufacturer.slug}`} className="font-semibold text-ink">
            {manufacturer.name}
          </Link>
          {manufacturer.verified ? <VerifiedBadge /> : null}
        </p>
        <h1 className="mt-2 text-2xl font-bold">{product.name}</h1>
        <p className="mt-2 text-xl font-extrabold text-brand-blue">
          {formatPriceInr(product.priceInr)} / {product.unit}
        </p>
        <p className="mt-1 text-sm text-ink-muted">MOQ {product.moq}</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">{product.description}</p>
        <dl className="mt-4 space-y-1 text-sm">
          {Object.entries(product.specs).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4 border-b border-line py-1.5">
              <dt className="text-ink-faint">{key}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex gap-2">
          <Link href="/rfq/new">
            <Button>Request quotation</Button>
          </Link>
          <Link href="/messages">
            <Button variant="outline">Message</Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
