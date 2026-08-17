import Link from "next/link";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { Manufacturer } from "@/entities/manufacturer";

type Props = {
  manufacturers: Manufacturer[];
};

export function VerifiedManufacturers({ manufacturers }: Props) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold">Verified Manufacturers</h2>
        <Link href="/explore" className="text-xs font-semibold text-brand-blue">
          View all
        </Link>
      </div>
      <ul className="space-y-3">
        {manufacturers.slice(0, 4).map((manufacturer) => (
          <li key={manufacturer.id} className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={manufacturer.logoUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-sm font-semibold">
                {manufacturer.name.replace(" Pvt. Ltd.", "").replace(" Industries", "")}
                {manufacturer.verified ? <VerifiedBadge /> : null}
              </p>
              <p className="text-xs text-ink-muted">{manufacturer.country}</p>
            </div>
            <Link
              href={`/manufacturers/${manufacturer.slug}`}
              className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-ink hover:bg-canvas"
            >
              Follow
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
