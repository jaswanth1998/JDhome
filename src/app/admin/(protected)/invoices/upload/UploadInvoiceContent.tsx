"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileUp, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  UPLOADED_INVOICE_BUCKET,
  UPLOADED_INVOICE_MAX_BYTES,
  removeUploadedInvoiceFile,
} from "@/lib/pdf/uploadedInvoice";

type Client = { id: string; name: string; email: string };

const PAYMENT_METHODS = ["E-Transfer", "Cash", "Cheque", "Credit Card"];
const NEW_CLIENT = "__new__";
const labelClass = "block text-xs font-medium text-[var(--text-muted)] mb-1";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function UploadInvoiceContent() {
  const { supabase, user } = useAuth();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [sentFrom, setSentFrom] = useState("");
  const [sentFromOptions, setSentFromOptions] = useState<string[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [status, setStatus] = useState<"paid" | "sent">("paid");
  const [subtotal, setSubtotal] = useState("");
  const [hst, setHst] = useState("");
  const [hstEdited, setHstEdited] = useState(false);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .schema("jdhome")
        .from("clients")
        .select("id, name, email")
        .order("name");
      setClients((data as Client[]) ?? []);

      // Offer companies already used, so the list filter stays tidy
      const { data: companies } = await supabase
        .schema("jdhome")
        .from("invoices")
        .select("sent_from_company")
        .not("sent_from_company", "is", null);
      setSentFromOptions(
        [
          ...new Set(
            ((companies as { sent_from_company: string }[]) ?? []).map(
              (c) => c.sent_from_company,
            ),
          ),
        ].sort(),
      );
    })();
  }, [supabase]);

  const subtotalNum = Number(subtotal) || 0;
  const hstNum = Number(hst) || 0;
  const total = round2(subtotalNum + hstNum);

  function handleSubtotalChange(value: string) {
    setSubtotal(value);
    // Keep HST at 13% until the user types their own figure
    if (!hstEdited)
      setHst(value ? round2(Number(value) * 0.13).toFixed(2) : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const number = invoiceNumber.trim();
    if (!clientId) return setError("Choose a client");
    if (clientId === NEW_CLIENT && (!clientName.trim() || !clientEmail.trim()))
      return setError("Enter the new client's name and email");
    if (!sentFrom.trim())
      return setError("Enter the company the invoice was sent from");
    if (!number) return setError("Enter the invoice number");
    // generate_invoice_number() casts the tail of INV-YYYYMM-… to an integer
    if (/^INV-\d{6}-/i.test(number) && !/^INV-\d{6}-\d+$/i.test(number))
      return setError(
        "Numbers starting with INV-YYYYMM- must end in digits only",
      );
    if (subtotalNum <= 0) return setError("Enter the subtotal");
    if (!file) return setError("Attach the invoice PDF");
    if (file.type !== "application/pdf")
      return setError("The file must be a PDF");
    if (file.size > UPLOADED_INVOICE_MAX_BYTES)
      return setError("The PDF must be 10 MB or smaller");

    setIsSaving(true);
    let uploadedPath: string | null = null;
    try {
      const { data: existing } = await supabase
        .schema("jdhome")
        .from("invoices")
        .select("id")
        .eq("invoice_number", number)
        .maybeSingle();
      if (existing) throw new Error(`Invoice ${number} already exists`);

      let finalClientId = clientId;
      if (clientId === NEW_CLIENT) {
        const { data: clientData, error: clientError } = await supabase
          .schema("jdhome")
          .from("clients")
          .insert({
            name: clientName.trim(),
            email: clientEmail.trim(),
            created_by: user?.id,
          })
          .select("id")
          .single();
        if (clientError)
          throw new Error("Failed to save client: " + clientError.message);
        finalClientId = clientData.id;
      }

      const path = `uploaded/${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from(UPLOADED_INVOICE_BUCKET)
        .upload(path, file, { contentType: "application/pdf" });
      if (uploadError)
        throw new Error("Failed to upload PDF: " + uploadError.message);
      uploadedPath = path;

      const now = new Date().toISOString();
      const { data: invoiceData, error: invoiceError } = await supabase
        .schema("jdhome")
        .from("invoices")
        .insert({
          invoice_number: number,
          client_id: finalClientId,
          invoice_date: invoiceDate,
          payment_method: paymentMethod,
          notes: notes.trim() || null,
          subtotal: subtotalNum,
          hst_rate: Math.round((hstNum / subtotalNum) * 10000) / 10000,
          hst_amount: hstNum,
          total,
          status,
          sent_at: now,
          paid_at: status === "paid" ? now : null,
          pdf_url: path,
          sent_from_company: sentFrom.trim(),
          share_enabled: false,
          created_by: user?.id,
        })
        .select("id")
        .single();
      if (invoiceError)
        throw new Error("Failed to save invoice: " + invoiceError.message);

      router.push(`/admin/invoices/view?id=${invoiceData.id}`);
    } catch (err) {
      if (uploadedPath) await removeUploadedInvoiceFile(supabase, uploadedPath);
      setError(err instanceof Error ? err.message : "Failed to save invoice");
      setIsSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/admin/invoices")}
          className="p-2 rounded-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Upload Existing Invoice
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Keep a copy of an invoice you already sent. Nothing is emailed.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-[var(--border-light)] p-4 sm:p-6 space-y-4 max-w-2xl"
      >
        <div>
          <label className={labelClass}>Client</label>
          <select
            className="input !h-10 text-sm"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">Select a client…</option>
            <option value={NEW_CLIENT}>+ New client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>

        {clientId === NEW_CLIENT && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Client Name</label>
              <input
                type="text"
                className="input !h-10 text-sm"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Client Email</label>
              <input
                type="email"
                className="input !h-10 text-sm"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Sent From (company)</label>
          <input
            type="text"
            list="sent-from-options"
            className="input !h-10 text-sm"
            placeholder="Company the invoice was issued from"
            value={sentFrom}
            onChange={(e) => setSentFrom(e.target.value)}
          />
          <datalist id="sent-from-options">
            {sentFromOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Invoice Number</label>
            <input
              type="text"
              className="input !h-10 text-sm"
              placeholder="As printed on the PDF"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Invoice Date</label>
            <input
              type="date"
              className="input !h-10 text-sm"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Payment Method</label>
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
          <div>
            <label className={labelClass}>Status</label>
            <select
              className="input !h-10 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as "paid" | "sent")}
            >
              <option value="paid">Paid</option>
              <option value="sent">Sent — not paid yet</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Subtotal</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input !h-10 text-sm"
              value={subtotal}
              onChange={(e) => handleSubtotalChange(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>HST</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input !h-10 text-sm"
              value={hst}
              onChange={(e) => {
                setHst(e.target.value);
                setHstEdited(true);
              }}
            />
          </div>
          <div>
            <label className={labelClass}>Total</label>
            <div className="input !h-10 text-sm flex items-center bg-[var(--neutral-lightest-gray)] font-medium">
              {total.toFixed(2)}
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Invoice PDF (max 10 MB)</label>
          <input
            type="file"
            accept="application/pdf"
            className="block w-full text-sm text-[var(--text-secondary)] file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[var(--neutral-light-gray)] file:text-[var(--text-primary)]"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div>
          <label className={labelClass}>Notes (optional)</label>
          <textarea
            className="input textarea text-sm !h-auto"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary btn-sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileUp className="w-4 h-4" />
            )}
            {isSaving ? "Saving..." : "Save invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
