"use client";

import { Save } from "lucide-react";
import type { ProfileFormData } from "./profile-types";
import { useTranslations } from "next-intl";

type Props = {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  isSaving: boolean;
  onSave: (e: React.FormEvent) => void;
};

export function ProfileDetailsPanel({ formData, setFormData, isSaving, onSave }: Props) {
  const t = useTranslations();
  return (
    <div className="glass-panel-liquid glass-fade-in p-5 sm:p-6">
      <div className="mb-5 pb-3 border-b border-white/30">
        <h2 className="text-base font-bold text-ink tracking-tight">{t("profile.details.corporateContactInformation")}</h2>
        <p className="text-xs text-ink-muted mt-0.5">
          {t("profile.details.manageYourCompanySourcingCredentials")}
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t("profile.details.primaryContactFullName")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="glass-input h-10"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-ink">{t("profile.details.accountBusinessEmail")}</label>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {t("profile.details.verifiedLoginId")}
              </span>
            </div>
            <input
              type="email"
              value={formData.email}
              readOnly
              disabled
              title={t("profile.details.yourLoginEmailServesAs")}
              className="glass-input h-10 bg-slate-100/70 text-slate-600 cursor-not-allowed border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t("profile.details.registeredCompanyName")}
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
              className="glass-input h-10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t("profile.details.industrySourcingSector")}
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              required
              className="glass-input h-10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t("profile.details.phoneWhatsappForFactoryRfq")}
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="glass-input h-10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t("profile.details.taxIdGstinBusinessReg")}
            </label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              className="glass-input h-10 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            {t("profile.details.primaryShippingPlantDeliveryAddress")}
          </label>
          <textarea
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="glass-input p-3 leading-relaxed"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/30">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,115,232,0.35)] transition-all hover:bg-brand-blue-dark active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4 shrink-0 text-white" />
            <span className="text-white">{isSaving ? t("profile.details.savingUpdates") : t("profile.details.saveProfileChanges")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
