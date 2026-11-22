"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Save, Send } from "lucide-react";
import { adminData, type AdminAlertSettings } from "@/shared/api/admin-api";
import { useToast } from "@/features/admin/ui";

const EVENTS: { key: keyof Pick<AdminAlertSettings, "newManufacturer" | "newUser" | "newContent" | "newPayment">; label: string; hint: string }[] = [
  { key: "newManufacturer", label: "New manufacturer", hint: "Registered and waiting for your approval" },
  { key: "newUser", label: "New buyer", hint: "Someone signed up as a buyer" },
  { key: "newContent", label: "New content", hint: "A manufacturer added a product or a seek" },
  { key: "newPayment", label: "New payment", hint: "A plan payment is waiting for review" },
];

/** Recipients as typed (one per line or comma separated) -> list. */
export function parseRecipients(text: string): string[] {
  return Array.from(new Set(text.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean)));
}

/** Admin → Settings → Email alerts: on/off, who receives them and which events. */
export function EmailAlerts() {
  const toast = useToast();
  const [draft, setDraft] = useState<AdminAlertSettings | null>(null);
  const [recipientsText, setRecipientsText] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snapshot = (s: AdminAlertSettings, text: string) => JSON.stringify({ ...s, updatedAt: null, recipients: parseRecipients(text) });

  const load = useCallback(() => {
    setError(null);
    adminData.alerts()
      .then((s) => {
        const text = s.recipients.join("\n");
        setDraft(s);
        setRecipientsText(text);
        setSaved(snapshot(s, text));
      })
      .catch((err) => setError((err as Error).message));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!draft) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-medium text-slate-900">Email alerts</h3>
        {error
          ? <p className="mt-2 text-sm text-red-600">{error} <button onClick={load} className="underline">Retry</button></p>
          : <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading</p>}
      </section>
    );
  }

  const dirty = snapshot(draft, recipientsText) !== saved;

  const save = async () => {
    setSaving(true);
    try {
      const next = await adminData.saveAlerts({ ...draft, recipients: parseRecipients(recipientsText) });
      const text = next.recipients.join("\n");
      setDraft(next);
      setRecipientsText(text);
      setSaved(snapshot(next, text));
      toast("success", next.enabled ? "Email alerts are on." : "Email alerts saved (off).");
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    try {
      const { sent } = await adminData.testAlerts();
      toast("success", `Test email sent to ${sent} address${sent === 1 ? "" : "es"}. Check inbox and spam.`);
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-medium text-slate-900"><Mail className="h-4 w-4" /> Email alerts</h3>
          <p className="mt-1 text-sm text-slate-500">Get an email when something needs an admin.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <input
            type="checkbox"
            role="switch"
            checked={draft.enabled}
            onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
            className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-slate-300 transition before:block before:h-4 before:w-4 before:translate-x-0.5 before:translate-y-0.5 before:rounded-full before:bg-white before:transition checked:bg-orange-500 checked:before:translate-x-[18px]"
          />
          {draft.enabled ? "On" : "Off"}
        </label>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-slate-900">Send to</span>
          <span className="mt-0.5 block text-xs text-slate-500">One email address per line (up to 10).</span>
          <textarea
            value={recipientsText}
            onChange={(e) => setRecipientsText(e.target.value)}
            rows={4}
            placeholder={"owner@company.com\nops@company.com"}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-orange-400 focus:outline-none"
          />
        </label>

        <fieldset className={draft.enabled ? "" : "opacity-60"}>
          <legend className="text-sm font-medium text-slate-900">Email me about</legend>
          <div className="mt-2 space-y-2">
            {EVENTS.map((ev) => (
              <label key={ev.key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={draft[ev.key]}
                  onChange={(e) => setDraft({ ...draft, [ev.key]: e.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-orange-500"
                />
                <span>
                  <span className="block text-sm text-slate-900">{ev.label}</span>
                  <span className="block text-xs text-slate-500">{ev.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-400 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
        <button
          onClick={test}
          disabled={dirty || testing || draft.recipients.length === 0}
          title={dirty ? "Save first" : undefined}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send test email
        </button>
        {dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
      </div>
    </section>
  );
}
