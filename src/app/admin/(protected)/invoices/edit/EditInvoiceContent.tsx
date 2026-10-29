"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { InvoiceForm } from "@/components/admin/invoices";
import type { InvoiceFormData } from "@/components/admin/invoices/InvoiceForm";
import type { InvoicePreviewData } from "@/components/admin/invoices/InvoicePreview";
import { sendDocument, toInvoiceDocument } from "@/lib/pdf";
import {
  createClient,
  findInvoiceByNumber,
  getClient,
  getInvoice,
  nowIso,
  updateClient,
  updateInvoice,
  type Client,
  type Invoice,
  type InvoicePatch,
} from "@/lib/db";

/** The invoice document joined (in memory) to its client. */
type InvoiceDetail = Invoice & { client: Client };

export default function EditInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // The side-by-side preview is currently hidden (see the commented JSX below);
  // the form still reports its computed values here.
  const [, setPreviewData] = useState<InvoicePreviewData>({
    invoiceNumber: "",
    clientName: "",
    clientAddress: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    paymentMethod: "E-Transfer",
    items: [],
    notes: "",
    subtotal: 0,
    hstAmount: 0,
    total: 0,
    signatureDataUrl: "",
  });

  const fetchInvoice = useCallback(async () => {
    if (!id) {
      router.push("/admin/invoices");
      return;
    }
    let data: Invoice | null = null;
    try {
      data = await getInvoice(id);
    } catch {
      data = null;
    }

    if (!data) {
      router.push("/admin/invoices");
      return;
    }

    // Uploaded invoices have no line items — saving this form would zero their totals
    if (data.pdf_name) {
      router.push(`/admin/invoices/view?id=${id}`);
      return;
    }

    let client: Client | null = null;
    try {
      client = await getClient(data.client_id);
    } catch {
      client = null;
    }
    if (!client) {
      router.push("/admin/invoices");
      return;
    }

    const items = [...data.items].sort((a, b) => a.sort_order - b.sort_order);
    setInvoice({ ...data, items, client });
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  async function persistInvoice(
    formData: InvoiceFormData,
    status: "draft" | "sent"
  ) {
    if (!invoice) throw new Error("Invoice not loaded");

    // 1. Upsert client
    let clientId = formData.clientId;
    if (!clientId) {
      try {
        const created = await createClient({
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone || null,
          address: formData.clientAddress || null,
        });
        clientId = created.id;
      } catch (err) {
        throw new Error(
          "Failed to save client: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    } else {
      // Update existing client info (best effort, as before)
      try {
        await updateClient(clientId, {
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone || null,
          address: formData.clientAddress || null,
        });
      } catch {
        /* ignore — the invoice still saves against the existing client */
      }
    }

    // 2. Compute totals
    const computedItems = formData.items.map((item, i) => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      return {
        description: item.description,
        quantity: qty,
        rate,
        amount: qty * rate,
        sort_order: i,
      };
    });
    const subtotal = computedItems.reduce((sum, i) => sum + i.amount, 0);
    const hstAmount = Math.round(subtotal * 0.13 * 100) / 100;
    const total = subtotal + hstAmount;

    // 3. Determine invoice number (editing never draws a new auto number)
    const finalInvoiceNumber = formData.autoGenerate
      ? invoice.invoice_number
      : formData.invoiceNumber.trim() || invoice.invoice_number;

    // Postgres had UNIQUE(invoice_number); keep a renamed invoice from
    // colliding with another one.
    if (finalInvoiceNumber !== invoice.invoice_number) {
      const clash = await findInvoiceByNumber(finalInvoiceNumber);
      if (clash && clash.id !== invoice.id)
        throw new Error(`Invoice ${finalInvoiceNumber} already exists`);
    }

    // 4. Update invoice record (items replace the whole list; share copy refreshed)
    const patch: InvoicePatch = {
      invoice_number: finalInvoiceNumber,
      client_id: clientId,
      invoice_date: formData.invoiceDate,
      payment_method: formData.paymentMethod,
      notes: formData.notes || null,
      client_signature: formData.signatureDataUrl || null,
      subtotal,
      hst_rate: 0.13,
      hst_amount: hstAmount,
      total,
      status,
      items: computedItems,
    };

    if (status === "sent" && invoice.status === "draft") {
      patch.sent_at = nowIso();
    }

    let saved: Invoice;
    try {
      saved = await updateInvoice(invoice.id, patch);
    } catch (err) {
      throw new Error(
        "Failed to update invoice: " +
          (err instanceof Error ? err.message : String(err))
      );
    }

    return {
      id: invoice.id,
      client: {
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone || null,
        address: formData.clientAddress || null,
        client_signature: formData.signatureDataUrl || null,
      },
      invoice: saved,
      invoice_items: saved.items,
    };
  }

  async function handleSaveDraft(formData: InvoiceFormData) {
    setIsSaving(true);
    try {
      const result = await persistInvoice(formData, "draft");
      router.push(`/admin/invoices/view?id=${result.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save invoice");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveAndSend(formData: InvoiceFormData) {
    setIsSaving(true);
    try {
      const result = await persistInvoice(formData, "sent");

      await sendDocument(
        toInvoiceDocument(
          result.invoice,
          result.client,
          result.invoice_items
        )
      );

      router.push(`/admin/invoices/view?id=${result.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save invoice");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
      </div>
    );
  }

  const initialData: InvoiceFormData = {
    invoiceNumber: invoice.invoice_number,
    autoGenerate: false,
    clientName: invoice.client.name,
    clientEmail: invoice.client.email,
    clientPhone: invoice.client.phone ?? "",
    clientAddress: invoice.client.address ?? "",
    clientId: invoice.client_id,
    invoiceDate: invoice.invoice_date,
    paymentMethod: invoice.payment_method,
    notes: invoice.notes ?? "",
    signatureDataUrl: invoice.client_signature ?? "",
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
    })),
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(`/admin/invoices/view?id=${invoice.id}`)}
          className="p-2 rounded-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Edit Invoice
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {invoice.invoice_number}
          </p>
        </div>
      </div>

      {/* Form + Preview layout */}
      <div >
        {/* Form */}
        <div className="bg-white rounded-lg border border-[var(--border-light)] p-4 sm:p-6">
          <InvoiceForm
            initialData={initialData}
            onPreviewChange={setPreviewData}
            onSaveDraft={handleSaveDraft}
            onSaveAndSend={handleSaveAndSend}
            isSaving={isSaving}
            saveLabels={{ draft: "Update Draft", send: "Update & Send" }}
          />
        </div>

        {/* Preview */}
        {/* <div className="hidden lg:block">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Preview
            </p>
            <InvoicePreview data={previewData} />
          </div>
        </div> */}
      </div>
    </div>
  );
}
