"use client";

/**
 * Document Settings — edits the single `jdhome.document_settings` row that
 * supplies all the fixed copy on generated invoices and estimates.
 *
 * A live PDF preview sits beside the form so changes can be checked before
 * saving. The preview is fed from local form state, so it updates without
 * touching the database.
 */
import { useState, useEffect, useCallback } from "react";
import { Loader2, Save, Plus, Trash2, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  DEFAULT_DOCUMENT_SETTINGS,
  SETTINGS_COLUMNS,
  rowToSettings,
  settingsToRow,
  invalidateDocumentSettings,
  type DocumentSettings,
  type TermsClause,
} from "@/lib/pdf/settings";
import { DocumentPdfViewer } from "@/lib/pdf";
import type { JDDocumentData } from "@/lib/pdf";

/** Realistic sample so the preview shows a fully populated document. */
const SAMPLE: JDDocumentData = {
  kind: "invoice",
  client: {
    name: "Sample Client Inc.",
    email: "client@example.com",
    phone: null,
    address: "123 Example Street\nBarrie, ON",
    client_signature: null,
  },
  meta: {
    number: "INV-PREVIEW-001",
    date: new Date().toISOString().split("T")[0],
    payment_method: "E-Transfer",
    notes: null,
    subtotal: 1250,
    hst_rate: 0.13,
    hst_amount: 162.5,
    total: 1412.5,
  },
  items: [
    { description: "Smart lock supply & installation", quantity: 2, rate: 425, amount: 850, sort_order: 0 },
    { description: "Deadbolt rekeying", quantity: 4, rate: 100, amount: 400, sort_order: 1 },
  ],
};

function Field({
  label,
  value,
  onChange,
  hint,
  multiline,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
        {label}
      </span>
      {multiline ? (
        <textarea
          className="input w-full"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && (
        <span className="block text-xs text-[var(--text-muted)] mt-1">
          {hint}
        </span>
      )}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-[var(--border-light)] p-4 sm:p-6">
      <h2 className="text-base font-bold text-[var(--text-primary)]">{title}</h2>
      {description && (
        <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">
          {description}
        </p>
      )}
      <div className={description ? "space-y-4" : "space-y-4 mt-4"}>
        {children}
      </div>
    </div>
  );
}

export default function SettingsContent() {
  const { supabase, profile } = useAuth();
  const [settings, setSettings] = useState<DocumentSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .schema("jdhome")
      .from("document_settings")
      .select(SETTINGS_COLUMNS)
      .maybeSingle();

    if (err || !data) {
      // No row yet (or unreadable) — start from the built-in defaults.
      setSettings(DEFAULT_DOCUMENT_SETTINGS);
      return;
    }
    setSettings(rowToSettings(data as never));
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  function patch<K extends keyof DocumentSettings>(
    key: K,
    value: DocumentSettings[K]
  ) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSavedAt(null);
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .schema("jdhome")
        .from("document_settings")
        .upsert({ id: true, ...settingsToRow(settings) }, { onConflict: "id" });

      if (err) throw new Error(err.message);

      // Make sure the next generated document picks the new values up.
      invalidateDocumentSettings();
      setSavedAt(new Date().toLocaleTimeString("en-CA"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
      </div>
    );
  }

  const readOnly = profile?.role !== "admin";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Document Settings
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Fixed copy used on every invoice and estimate PDF
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-xs text-green-600">Saved at {savedAt}</span>
          )}
          <button
            onClick={() => {
              setSettings(DEFAULT_DOCUMENT_SETTINGS);
              setSavedAt(null);
            }}
            className="btn btn-sm bg-white text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)] border border-[var(--border-light)]"
            title="Reset the form to the built-in defaults (not saved until you press Save)"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || readOnly}
            className="btn btn-primary btn-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {readOnly && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You need an admin role to save changes.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* ---------------- Form ---------------- */}
        <div className="space-y-6">
          <Section
            title="Company details"
            description="Shown in the top-left block of page 1."
          >
            <Field label="Phone" value={settings.companyPhone} onChange={(v) => patch("companyPhone", v)} />
            <Field label="Email" value={settings.companyEmail} onChange={(v) => patch("companyEmail", v)} />
            <Field label="Website" value={settings.companyWeb} onChange={(v) => patch("companyWeb", v)} />
            <Field label="Address" value={settings.companyAddress} onChange={(v) => patch("companyAddress", v)} />
            <Field label="GST / HST number" value={settings.companyGst} onChange={(v) => patch("companyGst", v)} />
          </Section>

          <Section title="Branding lines">
            <Field
              label="Tagline"
              value={settings.tagline}
              onChange={(v) => patch("tagline", v)}
              hint="Appears under the logo and again in the page-1 footer."
            />
            <Field label="Footer thank-you" value={settings.footerThanks} onChange={(v) => patch("footerThanks", v)} />
            <Field label="Footer badge" value={settings.footerBadge} onChange={(v) => patch("footerBadge", v)} />
          </Section>

          <Section
            title="Invoice terms"
            description="The acknowledgement paragraph on page 2 of an invoice."
          >
            <Field
              label="Terms"
              value={settings.invoiceTerms}
              onChange={(v) => patch("invoiceTerms", v)}
              multiline
              rows={7}
            />
          </Section>

          <Section
            title="Estimate terms"
            description="Numbered clauses on page 2 of an estimate. Add, edit or remove as needed."
          >
            {settings.estimateTerms.map((clause, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--border-light)] p-3 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Clause title"
                    value={clause.title}
                    onChange={(e) => {
                      const next = [...settings.estimateTerms];
                      next[i] = { ...next[i], title: e.target.value };
                      patch("estimateTerms", next);
                    }}
                  />
                  <button
                    onClick={() =>
                      patch(
                        "estimateTerms",
                        settings.estimateTerms.filter((_, j) => j !== i)
                      )
                    }
                    className="p-2 rounded hover:bg-red-50 text-[var(--text-muted)] hover:text-red-600 transition-colors"
                    title="Remove clause"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  className="input w-full"
                  rows={3}
                  placeholder="Clause text"
                  value={clause.body}
                  onChange={(e) => {
                    const next = [...settings.estimateTerms];
                    next[i] = { ...next[i], body: e.target.value };
                    patch("estimateTerms", next);
                  }}
                />
              </div>
            ))}
            <button
              onClick={() =>
                patch("estimateTerms", [
                  ...settings.estimateTerms,
                  { title: "", body: "" } as TermsClause,
                ])
              }
              className="btn btn-sm bg-white text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)] border border-[var(--border-light)]"
            >
              <Plus className="w-4 h-4" />
              Add clause
            </button>
          </Section>

          <Section
            title="Payment options"
            description="One bullet per line on page 2 — e-transfer address, card line, Square link, bank transfer."
          >
            {settings.paymentOptions.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  value={line}
                  onChange={(e) => {
                    const next = [...settings.paymentOptions];
                    next[i] = e.target.value;
                    patch("paymentOptions", next);
                  }}
                />
                <button
                  onClick={() =>
                    patch(
                      "paymentOptions",
                      settings.paymentOptions.filter((_, j) => j !== i)
                    )
                  }
                  className="p-2 rounded hover:bg-red-50 text-[var(--text-muted)] hover:text-red-600 transition-colors"
                  title="Remove line"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                patch("paymentOptions", [...settings.paymentOptions, ""])
              }
              className="btn btn-sm bg-white text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)] border border-[var(--border-light)]"
            >
              <Plus className="w-4 h-4" />
              Add line
            </button>
          </Section>

          <Section title="Cheque by mail">
            <Field label="Payable to" value={settings.chequePayableTo} onChange={(v) => patch("chequePayableTo", v)} />
            <Field
              label="Mail to"
              value={settings.chequeMailTo}
              onChange={(v) => patch("chequeMailTo", v)}
            />
          </Section>

          <Section
            title="Defaults"
            description="Used when creating new documents."
          >
            <Field
              label="HST rate"
              value={String(settings.defaultHstRate)}
              onChange={(v) => patch("defaultHstRate", Number(v) || 0)}
              hint="Decimal, e.g. 0.13 for 13%."
            />
          </Section>
        </div>

        {/* ---------------- Live preview ---------------- */}
        <div className="xl:sticky xl:top-6">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Live preview — sample invoice
          </p>
          <DocumentPdfViewer data={SAMPLE} settings={settings} />
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Reflects unsaved edits. Press Save to apply them to real documents.
          </p>
        </div>
      </div>
    </div>
  );
}
