"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Hash, Sparkles, PackagePlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { LineItemRow } from "./LineItemRow";
import { SignaturePad } from "./SignaturePad";
import type { InvoicePreviewData } from "./InvoicePreview";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

type LineItem = {
  description: string;
  quantity: number | string;
  rate: number | string;
};

export type InvoiceFormData = {
  invoiceNumber: string;
  autoGenerate: boolean;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientId: string | null;
  invoiceDate: string;
  paymentMethod: string;
  notes: string;
  items: LineItem[];
  signatureDataUrl: string;
};

const PAYMENT_METHODS = ["E-Transfer", "Cash", "Cheque", "Credit Card"];

const emptyItem: LineItem = { description: "", quantity: "", rate: "" };

function getToday() {
  return new Date().toISOString().split("T")[0];
}

type InvoiceFormProps = {
  initialData?: InvoiceFormData;
  onPreviewChange: (data: InvoicePreviewData) => void;
  onSaveDraft: (data: InvoiceFormData) => Promise<void>;
  onSaveAndSend: (data: InvoiceFormData) => Promise<void>;
  isSaving: boolean;
  saveLabels?: { draft: string; send: string };
};

export function InvoiceForm({
  initialData,
  onPreviewChange,
  onSaveDraft,
  onSaveAndSend,
  isSaving,
  saveLabels,
}: InvoiceFormProps) {
  const { supabase } = useAuth();

  const [autoGenerate, setAutoGenerate] = useState(
    initialData?.autoGenerate ?? true
  );
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialData?.invoiceNumber ?? ""
  );
  const [clientName, setClientName] = useState(initialData?.clientName ?? "");
  const [clientEmail, setClientEmail] = useState(
    initialData?.clientEmail ?? ""
  );
  const [clientPhone, setClientPhone] = useState(
    initialData?.clientPhone ?? ""
  );
  const [clientAddress, setClientAddress] = useState(
    initialData?.clientAddress ?? ""
  );
  const [clientId, setClientId] = useState<string | null>(
    initialData?.clientId ?? null
  );
  const [invoiceDate, setInvoiceDate] = useState(
    initialData?.invoiceDate ?? getToday()
  );
  const [paymentMethod, setPaymentMethod] = useState(
    initialData?.paymentMethod ?? PAYMENT_METHODS[0]
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [items, setItems] = useState<LineItem[]>(
    initialData?.items ?? [{ ...emptyItem }]
  );
  const [signatureDataUrl, setSignatureDataUrl] = useState(
    initialData?.signatureDataUrl ?? ""
  );

  // Service items catalog
  type ServiceItem = {
    id: string;
    name: string;
    description: string;
    default_rate: number;
    category: string;
  };
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState("");

  useEffect(() => {
    supabase
      .schema("jdhome")
      .from("service_items")
      .select("id, name, description, default_rate, category")
      .eq("is_active", true)
      .order("category")
      .order("name")
      .then(({ data }) => setServiceItems((data as ServiceItem[]) ?? []));
  }, [supabase]);

  const filteredCatalog = catalogQuery
    ? serviceItems.filter(
        (s) =>
          s.name.toLowerCase().includes(catalogQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(catalogQuery.toLowerCase())
      )
    : serviceItems;

  function addFromCatalog(service: ServiceItem) {
    setItems((prev) => [
      ...prev,
      { description: service.description, quantity: 1, rate: service.default_rate },
    ]);
    setShowCatalog(false);
    setCatalogQuery("");
  }

  // Client search
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [showClientSearch, setShowClientSearch] = useState(false);

  const searchClients = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setClientResults([]);
        return;
      }
      const { data } = await supabase
        .schema("jdhome")
        .from("clients")
        .select("id, name, email, phone, address")
        .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(5);
      setClientResults((data as Client[]) ?? []);
    },
    [supabase]
  );

  useEffect(() => {
    const timeout = setTimeout(() => searchClients(clientQuery), 300);
    return () => clearTimeout(timeout);
  }, [clientQuery, searchClients]);

  function selectClient(client: Client) {
    setClientId(client.id);
    setClientName(client.name);
    setClientEmail(client.email);
    setClientPhone(client.phone ?? "");
    setClientAddress(client.address ?? "");
    setShowClientSearch(false);
    setClientQuery("");
    setClientResults([]);
  }

  // Line item handlers
  function handleItemChange(
    index: number,
    field: "description" | "quantity" | "rate",
    value: string
  ) {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  // Computed values
  const computedItems = items.map((item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return {
      description: item.description,
      quantity: qty,
      rate,
      amount: qty * rate,
    };
  });
  const subtotal = computedItems.reduce((sum, i) => sum + i.amount, 0);
  const hstAmount = Math.round(subtotal * 0.13 * 100) / 100;
  const total = subtotal + hstAmount;

  // Push preview data upstream
  useEffect(() => {
    onPreviewChange({
      invoiceNumber: autoGenerate ? "Auto" : invoiceNumber,
      clientName,
      clientAddress,
      invoiceDate,
      paymentMethod,
      items: computedItems,
      notes,
      subtotal,
      hstAmount,
      total,
      signatureDataUrl,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autoGenerate,
    invoiceNumber,
    clientName,
    clientAddress,
    invoiceDate,
    paymentMethod,
    notes,
    signatureDataUrl,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(items),
  ]);

  function getFormData(): InvoiceFormData {
    return {
      invoiceNumber,
      autoGenerate,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      clientId,
      invoiceDate,
      paymentMethod,
      notes,
      items,
      signatureDataUrl,
    };
  }

  // Validation
  function validate(): string | null {
    if (!autoGenerate && !invoiceNumber.trim())
      return "Invoice number is required (or switch to auto-generate)";
    if (!clientName.trim()) return "Client name is required";
    if (!clientEmail.trim()) return "Client email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail))
      return "Invalid email address";
    if (items.length === 0) return "Add at least one line item";
    for (let i = 0; i < items.length; i++) {
      if (!items[i].description.trim())
        return `Item ${i + 1}: description is required`;
      if (!Number(items[i].quantity))
        return `Item ${i + 1}: quantity must be greater than 0`;
      if (Number(items[i].rate) < 0)
        return `Item ${i + 1}: rate cannot be negative`;
    }
    return null;
  }

  const [error, setError] = useState<string | null>(null);

  async function handleSave(sendAfter: boolean) {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (sendAfter) {
      await onSaveAndSend(getFormData());
    } else {
      await onSaveDraft(getFormData());
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Client Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Client
          </h3>
          <button
            type="button"
            onClick={() => setShowClientSearch(!showClientSearch)}
            className="text-xs text-[var(--accent-teal)] hover:underline flex items-center gap-1"
          >
            <Search className="w-3 h-3" />
            Search existing
          </button>
        </div>

        {showClientSearch && (
          <div className="relative">
            <input
              type="text"
              className="input !h-10 text-sm"
              placeholder="Search by name or email..."
              value={clientQuery}
              onChange={(e) => setClientQuery(e.target.value)}
              autoFocus
            />
            {clientResults.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[var(--border-light)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {clientResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectClient(c)}
                    className="w-full text-left px-3 py-2 hover:bg-[var(--neutral-light-gray)] text-sm border-b border-[var(--border-light)] last:border-b-0"
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-[var(--text-muted)] ml-2">
                      {c.email}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Name *
            </label>
            <input
              type="text"
              className="input !h-10 text-sm"
              placeholder="Client full name"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setClientId(null);
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Email *
            </label>
            <input
              type="email"
              className="input !h-10 text-sm"
              placeholder="client@email.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Phone
            </label>
            <input
              type="tel"
              className="input !h-10 text-sm"
              placeholder="(XXX) XXX-XXXX"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Address
            </label>
            <input
              type="text"
              className="input !h-10 text-sm"
              placeholder="Full address"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Invoice Number */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
          Invoice Number
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setAutoGenerate(true);
              setInvoiceNumber("");
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              autoGenerate
                ? "bg-[var(--accent-teal)] text-white border-[var(--accent-teal)]"
                : "bg-white text-[var(--text-secondary)] border-[var(--border-light)] hover:border-[var(--accent-teal)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-generate
          </button>
          <button
            type="button"
            onClick={() => setAutoGenerate(false)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              !autoGenerate
                ? "bg-[var(--accent-teal)] text-white border-[var(--accent-teal)]"
                : "bg-white text-[var(--text-secondary)] border-[var(--border-light)] hover:border-[var(--accent-teal)]"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            Custom
          </button>
        </div>
        {autoGenerate ? (
          <p className="text-xs text-[var(--text-muted)]">
            A number will be assigned automatically when saved (e.g. INV-202603-001)
          </p>
        ) : (
          <input
            type="text"
            className="input !h-10 text-sm"
            placeholder="e.g. INV-2026-001 or QUOTE-001"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            autoFocus
          />
        )}
      </section>

      {/* Invoice Details */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
          Invoice Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              className="input !h-10 text-sm"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Payment Method
            </label>
            <select
              className="input !h-10 text-sm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Line Items */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
          Line Items
        </h3>

        {/* Column headers - desktop only */}
        <div className="hidden sm:grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          <span>Description</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
          <span />
        </div>

        {items.map((item, i) => (
          <LineItemRow
            key={i}
            index={i}
            description={item.description}
            quantity={item.quantity}
            rate={item.rate}
            amount={computedItems[i].amount}
            onChange={handleItemChange}
            onRemove={removeItem}
            canRemove={items.length > 1}
          />
        ))}

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 text-sm text-[var(--accent-teal)] hover:text-[var(--accent-teal-hover)] font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Blank Item
          </button>
          {serviceItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCatalog(!showCatalog)}
              className="flex items-center gap-1.5 text-sm text-[var(--primary-main)] hover:text-[var(--primary-dark)] font-medium"
            >
              <PackagePlus className="w-4 h-4" />
              Add from Catalog
            </button>
          )}
        </div>

        {/* Catalog picker */}
        {showCatalog && (
          <div className="border border-[var(--border-light)] rounded-lg bg-white shadow-lg overflow-hidden">
            <div className="p-2 border-b border-[var(--border-light)]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  className="input !h-8 text-xs !pl-8"
                  placeholder="Search service items..."
                  value={catalogQuery}
                  onChange={(e) => setCatalogQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredCatalog.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-4">
                  No items found
                </p>
              ) : (
                filteredCatalog.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addFromCatalog(s)}
                    className="w-full text-left px-3 py-2 hover:bg-[var(--neutral-lightest-gray)] border-b border-[var(--border-light)] last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {s.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] ml-2">
                          {s.category}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[var(--accent-teal)] shrink-0 ml-3">
                        ${Number(s.default_rate).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                      {s.description}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* Notes */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
          Notes
        </h3>
        <textarea
          className="input textarea text-sm !h-auto"
          placeholder="Site location, special instructions, etc."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </section>

      {/* Client Signature */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
          Client Signature
        </h3>
        <SignaturePad
          initialDataUrl={initialData?.signatureDataUrl}
          onChange={setSignatureDataUrl}
        />
      </section>

      {/* Totals */}
      <section className="bg-[var(--neutral-lightest-gray)] rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">Subtotal</span>
          <span className="font-medium">
            {subtotal.toLocaleString("en-CA", {
              style: "currency",
              currency: "CAD",
            })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">HST (13%)</span>
          <span className="font-medium">
            {hstAmount.toLocaleString("en-CA", {
              style: "currency",
              currency: "CAD",
            })}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-[var(--border-light)] pt-2">
          <span className="text-[var(--primary-main)]">Total Due</span>
          <span className="text-[var(--primary-main)]">
            {total.toLocaleString("en-CA", {
              style: "currency",
              currency: "CAD",
            })}
          </span>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="btn btn-outline btn-sm flex-1"
        >
          {isSaving ? "Saving..." : (saveLabels?.draft ?? "Save Draft")}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="btn btn-primary btn-sm flex-1"
        >
          {isSaving ? "Sending..." : (saveLabels?.send ?? "Save & Send")}
        </button>
      </div>
    </div>
  );
}
