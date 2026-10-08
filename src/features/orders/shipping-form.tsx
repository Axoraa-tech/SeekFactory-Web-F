"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import type { OrderContact } from "@/entities/order";
import type { BuyerProfile } from "@/entities/user";
import { useTranslations } from "next-intl";

type Props = {
  user: BuyerProfile;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (contact: OrderContact) => void;
  /** The cart collects a note per product instead of one shared note. */
  showNote?: boolean;
  /** Blocks submitting (e.g. nothing selected); the reason is shown by the caller. */
  disabled?: boolean;
};

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition";

/** Delivery contact shared with the factory, prefilled from the buyer's profile. */
export function ShippingForm({ user, submitLabel, submitting, error, onSubmit, showNote = true, disabled = false }: Props) {
  const t = useTranslations();
  const [shippingName, setShippingName] = useState(user.name || "");
  const [shippingPhone, setShippingPhone] = useState(user.phone || "");
  const [shippingAddress, setShippingAddress] = useState(user.address || "");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      contactName: shippingName.trim(),
      contactPhone: shippingPhone.trim(),
      deliveryAddress: shippingAddress.trim(),
      note: showNote ? notes.trim() || undefined : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-[11px] font-semibold text-ink-muted">{t("orders.shipping.contactName")}</span>
          <input
            required
            value={shippingName}
            onChange={(e) => setShippingName(e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-semibold text-ink-muted">{t("orders.shipping.contactPhone")}</span>
          <input
            required
            value={shippingPhone}
            onChange={(e) => setShippingPhone(e.target.value)}
            className={inputClass}
            autoComplete="tel"
            inputMode="tel"
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-[11px] font-semibold text-ink-muted">{t("orders.shipping.deliveryAddress")}</span>
        <textarea
          required
          rows={3}
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          className={inputClass}
          autoComplete="street-address"
        />
      </label>
      {showNote && (
        <label className="block space-y-1">
          <span className="text-[11px] font-semibold text-ink-muted">{t("orders.shipping.notesForTheFactoryOptional")}</span>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("orders.shipping.packagingDeliveryWindowInspectionRequirements")}
            className={inputClass}
          />
        </label>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || disabled}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 text-sm font-bold text-white shadow-sm hover:from-rose-700 hover:to-red-700 transition active:scale-[0.99] disabled:opacity-70"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{submitting ? t("common.sending") : submitLabel}</span>
      </button>
    </form>
  );
}
