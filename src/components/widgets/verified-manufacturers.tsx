"use client";

import { VerifiedManufacturersList } from "@/components/manufacturers/verified-manufacturers-list";
import type { Manufacturer } from "@/entities/manufacturer";

type Props = {
  manufacturers: Manufacturer[];
};

/** Right-rail widget — thin wrapper around shared list. */
export function VerifiedManufacturers({ manufacturers }: Props) {
  return <VerifiedManufacturersList manufacturers={manufacturers} layout="rail" />;
}
