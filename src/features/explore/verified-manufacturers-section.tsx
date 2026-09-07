"use client";

import { VerifiedManufacturersList } from "@/components/manufacturers/verified-manufacturers-list";
import type { Manufacturer } from "@/entities/manufacturer";

type Props = {
  manufacturers: Manufacturer[];
};

/** Explore page section — thin wrapper around shared list. */
export function VerifiedManufacturersSection({ manufacturers }: Props) {
  return <VerifiedManufacturersList manufacturers={manufacturers} layout="explore" />;
}
