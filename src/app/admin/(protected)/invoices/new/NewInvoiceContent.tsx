"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { InvoiceForm } from "@/components/admin/invoices";
import type { InvoiceFormData } from "@/components/admin/invoices/InvoiceForm";
import type { InvoicePreviewData } from "@/components/admin/invoices/InvoicePreview";
import { sendDocument, toInvoiceDocument } from "@/lib/pdf";
import {
  createClient,
  createInvoice,
  findInvoiceByNumber,
  updateClient,
  type Invoice,
} from "@/lib/db";

export default function NewInvoiceContent() {
  const router = useRouter();
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

  async function saveInvoice(
    formData: InvoiceFormData,
    status: "draft" | "sent"
  ) {
    // 1. Determine invoice number — auto numbers are reserved by createInvoice
    //    inside its transaction; custom numbers must be unique (Postgres had
    //    UNIQUE(invoice_number)), so check before saving.
    let customNumber: string | undefined;
    if (!formData.autoGenerate) {
      customNumber = formData.invoiceNumber.trim();
      if (!customNumber) throw new Error("Invoice number is required");
      if (await findInvoiceByNumber(customNumber))
        throw new Error(`Invoice ${customNumber} already exists`);
    }

    // 2. Upsert client
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

    // 3. Compute totals
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

    // 4. Save invoice (line items embedded, number reserved, share copy written)
    let invoice: Invoice;
    try {
      invoice = await createInvoice(
        {
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
        },
        customNumber ? { invoice_number: customNumber } : {}
      );
    } catch (err) {
      throw new Error(
        "Failed to save invoice: " +
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
      invoice,
      invoice_items: invoice.items,
    };
  }

  async function handleSaveDraft(formData: InvoiceFormData) {
    setIsSaving(true);
    try {
      const result = await saveInvoice(formData, "draft");
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
      const result = await saveInvoice(formData, "sent");

      // Render the PDF in the browser, then hand it to n8n to email
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
            New Invoice
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Fill in the details below
          </p>
        </div>
      </div>

      {/* Form + Preview layout */}
      <div >
        {/* Form */}
        <div className="bg-white rounded-lg border border-[var(--border-light)] p-4 sm:p-6">
          <InvoiceForm
            onPreviewChange={setPreviewData}
            onSaveDraft={handleSaveDraft}
            onSaveAndSend={handleSaveAndSend}
            isSaving={isSaving}
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
