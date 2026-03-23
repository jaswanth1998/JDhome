"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  InvoiceForm,
  InvoicePreview,
} from "@/components/admin/invoices";
import type { InvoiceFormData } from "@/components/admin/invoices/InvoiceForm";
import type { InvoicePreviewData } from "@/components/admin/invoices/InvoicePreview";

export default function NewInvoiceContent() {
  const { supabase, user } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [previewData, setPreviewData] = useState<InvoicePreviewData>({
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
    // 1. Determine invoice number
    let invoiceNumber: string;
    if (formData.autoGenerate) {
      const { data: numData, error: numError } = await supabase
        .schema("jdhome")
        .rpc("generate_invoice_number");
      if (numError) throw new Error("Failed to generate invoice number: " + numError.message);
      invoiceNumber = numData as string;
    } else {
      invoiceNumber = formData.invoiceNumber.trim();
      if (!invoiceNumber) throw new Error("Invoice number is required");
    }

    // 2. Upsert client
    let clientId = formData.clientId;
    if (!clientId) {
      const { data: clientData, error: clientError } = await supabase
        .schema("jdhome")
        .from("clients")
        .insert({
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone || null,
          address: formData.clientAddress || null,
          created_by: user?.id,
        })
        .select("id")
        .single();

      if (clientError) throw new Error("Failed to save client: " + clientError.message);
      clientId = clientData.id;
    } else {
      // Update existing client info
      await supabase
        .schema("jdhome")
        .from("clients")
        .update({
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone || null,
          address: formData.clientAddress || null,
        })
        .eq("id", clientId);
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

    // 4. Insert invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .schema("jdhome")
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
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
        created_by: user?.id,
      })
      .select("id")
      .single();

    if (invoiceError) throw new Error("Failed to save invoice: " + invoiceError.message);

    // 5. Insert line items
    const itemsToInsert = computedItems.map((item) => ({
      invoice_id: invoiceData.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      sort_order: item.sort_order,
    }));

    const { error: itemsError } = await supabase
      .schema("jdhome")
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) throw new Error("Failed to save line items: " + itemsError.message);

    return {
      id: invoiceData.id,
      client: {
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone || null,
        address: formData.clientAddress || null,
        client_signature: formData.signatureDataUrl || null,
        created_by: user?.id,
      },
      invoice: {
        invoice_number: invoiceNumber,
        client_id: clientId,
        invoice_date: formData.invoiceDate,
        payment_method: formData.paymentMethod,
        notes: formData.notes || null,
        subtotal,
        hst_rate: 0.13,
        hst_amount: hstAmount,
        total,
        status,
        created_by: user?.id,
      },
      invoice_items: itemsToInsert,
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

      // Call webhook to send invoice
      const webhookRes = await fetch(
        "https://myn8n.plaper.org/webhook/a92a21d9-2c77-456a-b657-61694a39e1a0",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: result.client,
            invoice: result.invoice,
            invoice_items: result.invoice_items,
          }),
        }
      );

      if (!webhookRes.ok) {
        throw new Error("Failed to send invoice via webhook");
      }

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Preview
            </p>
            <InvoicePreview data={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
