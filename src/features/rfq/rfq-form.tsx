"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/entities/category";
import { getApi } from "@/shared/api";

type Props = {
  categories: Category[];
};

export function RfqForm({ categories }: Props) {
  const [status, setStatus] = useState<"idle" | "saving" | "sent">("idle");
  const [id, setId] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("saving");
    const result = await getApi().rfq.submit({
      productName: String(form.get("productName") ?? ""),
      quantity: String(form.get("quantity") ?? ""),
      details: `${form.get("category") ? `[${form.get("category")}] ` : ""}${String(form.get("details") ?? "")}`,
      companyName: String(form.get("companyName") ?? ""),
    });
    setId(result.id);
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-card border border-line bg-brand-blue-soft p-6">
        <p className="font-semibold text-brand-blue">RFQ submitted (mock)</p>
        <p className="mt-1 text-sm text-ink-muted">
          Reference {id}. Wire this form to REST later — the repository contract is already in place.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Product / keyword" name="productName" placeholder="e.g. CNC turning machine" />
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Category</span>
        <select
          name="category"
          defaultValue=""
          className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <Field label="Quantity" name="quantity" placeholder="MOQ / target quantity" />
      <Field label="Company name" name="companyName" placeholder="Your company" />
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Specifications</span>
        <textarea
          name="details"
          required
          rows={4}
          placeholder="Material, tolerance, certifications, target price"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </label>
      <Button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Sending…" : "Post buying request"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        name={name}
        required
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue"
      />
    </label>
  );
}
