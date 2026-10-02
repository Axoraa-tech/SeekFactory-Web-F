"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, FileText, Loader2, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { getApi } from "@/shared/api";
import { formatRelativeTime } from "@/shared/lib/format";
import type { RfqItem, RfqQuote } from "@/entities/rfq";
import type { OrderContact } from "@/entities/order";
import type { BuyerProfile } from "@/entities/user";
import type { Category } from "@/entities/category";
import { ShippingForm } from "@/features/orders/shipping-form";
import { formatMoney } from "@/features/orders/order-status";
import { useTranslations, useLocale } from "next-intl";

type Props = {
  user: BuyerProfile;
  rfqs: RfqItem[];
  categories: Category[];
  /** RFQ to open on load (from a notification link). */
  focusRfqId?: string;
  onChange: (rfq: RfqItem) => void;
  onToast: (message: string) => void;
};

const RFQ_STATUS: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "rfq.status.open", className: "text-amber-700 bg-amber-50 border-amber-200" },
  REVIEWING: { label: "rfq.status.review", className: "text-amber-700 bg-amber-50 border-amber-200" },
  QUOTING: { label: "rfq.status.collecting", className: "text-amber-700 bg-amber-50 border-amber-200" },
  QUOTED: { label: "rfq.status.quoted", className: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  ACCEPTED: { label: "rfq.status.accepted", className: "text-brand-blue bg-blue-50 border-blue-200" },
  IN_PRODUCTION: { label: "rfq.status.production", className: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  COMPLETED: { label: "rfq.status.completed", className: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  CANCELLED: { label: "rfq.status.cancelled", className: "text-slate-600 bg-slate-100 border-slate-200" },
};

const OPEN = new Set(["SUBMITTED", "REVIEWING", "QUOTING", "QUOTED"]);

const QUOTE_STATUS: Record<string, string> = {
  PENDING: "text-amber-700 bg-amber-50 border-amber-200",
  ACCEPTED: "text-emerald-700 bg-emerald-50 border-emerald-200",
  REJECTED: "text-slate-500 bg-slate-100 border-slate-200",
  EXPIRED: "text-slate-500 bg-slate-100 border-slate-200",
};

export function ProfileRfqsPanel({ user, rfqs, categories, focusRfqId, onChange, onToast }: Props) {
  const locale = useLocale();
  const t = useTranslations();
  const [openId, setOpenId] = useState<string | null>(focusRfqId ?? null);
  const [details, setDetails] = useState<Record<string, RfqItem>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [acceptingQuote, setAcceptingQuote] = useState<RfqQuote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryName = (id?: string) => categories.find((c) => c.id === id)?.name;

  const load = async (rfqId: string) => {
    setLoadingId(rfqId);
    setError(null);
    try {
      const detail = await getApi().rfq.getMine(rfqId);
      setDetails((prev) => ({ ...prev, [rfqId]: detail }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("rfq.buyer.couldNotLoadQuotes"));
    } finally {
      setLoadingId(null);
    }
  };

  const toggle = (rfqId: string) => {
    setAcceptingQuote(null);
    if (openId === rfqId) {
      setOpenId(null);
      return;
    }
    setOpenId(rfqId);
    if (!details[rfqId]) void load(rfqId);
  };

  // A notification link can open one RFQ directly
  useEffect(() => {
    if (focusRfqId) void load(focusRfqId);
  }, [focusRfqId]);

  const apply = (updated: RfqItem) => {
    setDetails((prev) => ({ ...prev, [updated.id]: updated }));
    onChange(updated);
  };

  const act = async (action: () => Promise<RfqItem>, success: string) => {
    setBusy(true);
    setError(null);
    try {
      apply(await action());
      setAcceptingQuote(null);
      onToast(success);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setBusy(false);
    }
  };

  const accept = (rfq: RfqItem, quote: RfqQuote, contact: OrderContact) =>
    act(() => getApi().rfq.acceptQuote(rfq.id, quote.id, contact), t("rfq.buyer.quoteAcceptedOrderRequestSent", { name: quote.manufacturer.name }));

  return (
    <div className="space-y-4 glass-fade-in">
      <div className="glass-panel-liquid p-4 sm:p-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">{t("rfq.buyer.activeBuyingRequestsRfqs")}</h2>
          <p className="text-xs text-ink-muted">
            {t("rfq.buyer.reviewFactoryQuotesAcceptOne")}
          </p>
        </div>

        <Link
          href="/rfq/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-blue-dark transition-all active:scale-95 shadow-sm shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{t("rfq.buyer.postNewRfq")}</span>
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      {rfqs.length === 0 ? (
        <div className="glass-panel-liquid p-12 text-center space-y-2">
          <FileText className="h-8 w-8 mx-auto text-ink-faint" />
          <p className="font-bold text-sm text-ink">{t("rfq.buyer.noRfqsYet")}</p>
          <p className="text-xs text-ink-muted">{t("rfq.buyer.postABuyingRequestAnd")}</p>
          <Link href="/rfq/new" className="inline-block mt-2 rounded-full bg-brand-blue px-4 py-1.5 text-xs font-bold text-white">
            {t("rfq.buyer.postAnRfq")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rfqs.map((listed) => {
            const rfq = details[listed.id] ?? listed;
            const status = RFQ_STATUS[rfq.status] ?? { label: rfq.status, className: "text-slate-600 bg-slate-100 border-slate-200" };
            const isOpen = openId === rfq.id;
            const quoteCount = rfq.quotes?.length ?? rfq.quoteCount ?? 0;
            const category = categoryName(rfq.categoryId);
            return (
              <div key={rfq.id} className="glass-panel-liquid p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ink-muted">{rfq.referenceNumber}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", status.className)}>
                        {t.has(status.label) ? t(status.label) : status.label}
                      </span>
                      <span className="text-[11px] text-ink-faint">{t("rfq.buyer.posted")} {formatRelativeTime(rfq.createdAt, locale)}</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-ink truncate">{rfq.productName}</h3>
                    {rfq.manufacturerName && (
                      <p className="text-xs text-ink-muted truncate">
                        {t("rfq.buyer.sentTo")}{" "}
                        {rfq.manufacturerSlug ? (
                          <Link href={`/manufacturers/${rfq.manufacturerSlug}`} className="font-semibold text-brand-blue hover:underline">
                            {rfq.manufacturerName}
                          </Link>
                        ) : (
                          <strong className="text-ink">{rfq.manufacturerName}</strong>
                        )}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                      {category && (
                        <>
                          <span>
                            {t("rfq.buyer.category")} <strong className="text-ink">{category}</strong>
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        {t("rfq.buyer.target")} <strong className="text-ink">{rfq.quantity} {rfq.unit}</strong>
                      </span>
                      {rfq.targetPrice && (
                        <>
                          <span>•</span>
                          <span>
                            {t("rfq.buyer.estPrice")} <strong className="text-brand-orange">{rfq.currency} {rfq.targetPrice}</strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {OPEN.has(rfq.status) && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm(t("rfq.buyer.cancelFactoriesWillStopQuoting", { referenceNumber: rfq.referenceNumber }))) {
                            void act(() => getApi().rfq.cancel(rfq.id), `${rfq.referenceNumber} cancelled`);
                          }
                        }}
                        className="text-[11px] font-semibold text-ink-faint hover:text-rose-600 disabled:opacity-50"
                      >
                        {t("common.cancel")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggle(rfq.id)}
                      aria-expanded={isOpen}
                      className="glass-liquid-item inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-ink hover:text-brand-blue"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-brand-blue" />
                      <span>{t("rfq.buyer.viewBids")}{quoteCount})</span>
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-white/60 pt-3 space-y-2">
                    {loadingId === rfq.id ? (
                      <p className="flex items-center gap-2 text-xs text-ink-muted">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("rfq.buyer.loadingQuotes")}
                      </p>
                    ) : (rfq.quotes?.length ?? 0) === 0 ? (
                      <p className="text-xs text-ink-muted">{t("rfq.buyer.noQuotesYetMatchingFactories")}</p>
                    ) : (
                      rfq.quotes!.map((quote) => (
                        <div key={quote.id} className="rounded-xl border border-line bg-white/70 p-3 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                href={`/manufacturers/${quote.manufacturer.slug}`}
                                className="text-xs font-bold text-ink hover:text-brand-blue"
                              >
                                {quote.manufacturer.name}
                              </Link>
                              <p className="text-[11px] text-ink-muted">
                                {formatMoney(quote.quotePrice, quote.currency)} {t("rfq.buyer.total")} {quote.leadTimeDays} {t("rfq.buyer.daysLeadTime")}{" "}
                                {formatRelativeTime(quote.createdAt, locale)}
                              </p>
                              {quote.notes && <p className="mt-1 text-xs text-ink">{quote.notes}</p>}
                            </div>
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", QUOTE_STATUS[quote.status] ?? QUOTE_STATUS.EXPIRED)}>
                              {quote.status.charAt(0) + quote.status.slice(1).toLowerCase()}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/messages?with=${quote.manufacturer.slug}`}
                              className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-ink hover:text-brand-blue"
                            >
                              {t("common.chat")}
                            </Link>
                            {quote.status === "ACCEPTED" && quote.orderId && (
                              <Link href={`/orders#${quote.orderId}`} className="rounded-full bg-brand-blue px-3 py-1 text-[11px] font-bold text-white">
                                {t("rfq.buyer.viewOrder")}
                              </Link>
                            )}
                            {quote.status === "PENDING" && OPEN.has(rfq.status) && (
                              <>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => setAcceptingQuote(quote)}
                                  className="rounded-full bg-brand-blue px-3 py-1 text-[11px] font-bold text-white hover:bg-brand-blue-dark disabled:opacity-50"
                                >
                                  {t("rfq.buyer.acceptOrder")}
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    void act(() => getApi().rfq.rejectQuote(rfq.id, quote.id), `Declined ${quote.manufacturer.name}'s quote`)
                                  }
                                  className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-ink-muted hover:text-rose-600 disabled:opacity-50"
                                >
                                  {t("common.decline")}
                                </button>
                              </>
                            )}
                          </div>

                          {acceptingQuote?.id === quote.id && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 space-y-2">
                              <p className="text-xs font-semibold text-ink">
                                {t("rfq.buyer.deliveryDetailsForTheOrder")} {quote.manufacturer.name}
                              </p>
                              <ShippingForm
                                user={user}
                                submitLabel={t("rfq.buyer.acceptQuote", { formatMoney: formatMoney(quote.quotePrice, quote.currency) })}
                                submitting={busy}
                                error={null}
                                onSubmit={(contact) => void accept(rfq, quote, contact)}
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
