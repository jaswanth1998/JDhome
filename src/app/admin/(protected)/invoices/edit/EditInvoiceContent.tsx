"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  InvoiceForm,
  InvoicePreview,
} from "@/components/admin/invoices";
import type { InvoiceFormData } from "@/components/admin/invoices/InvoiceForm";
import type { InvoicePreviewData } from "@/components/admin/invoices/InvoicePreview";

type InvoiceDetail = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  payment_method: string;
  notes: string | null;
  client_signature: string | null;
  subtotal: number;
  hst_rate: number;
  hst_amount: number;
  total: number;
  status: string;
  client_id: string;
  client: {
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
  };
  invoice_items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    sort_order: number;
  }[];
};

export default function EditInvoiceContent() {
  const { supabase, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
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

  const fetchInvoice = useCallback(async () => {
    if (!id) {
      router.push("/admin/invoices");
      return;
    }
    const { data, error } = await supabase
      .schema("jdhome")
      .from("invoices")
      .select(
        `
        id, invoice_number, invoice_date, payment_method, notes, client_signature,
        subtotal, hst_rate, hst_amount, total, status, client_id,
        client:clients(name, email, phone, address),
        invoice_items(description, quantity, rate, amount, sort_order)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      router.push("/admin/invoices");
      return;
    }

    const inv = data as unknown as InvoiceDetail;
    inv.invoice_items.sort((a, b) => a.sort_order - b.sort_order);
    setInvoice(inv);
    setLoading(false);
  }, [supabase, id, router]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  async function updateInvoice(
    formData: InvoiceFormData,
    status: "draft" | "sent"
  ) {
    if (!invoice) throw new Error("Invoice not loaded");

    // 1. Upsert client
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

      if (clientError)
        throw new Error("Failed to save client: " + clientError.message);
      clientId = clientData.id;
    } else {
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

    // 3. Determine invoice number
    const finalInvoiceNumber = formData.autoGenerate
      ? invoice.invoice_number
      : formData.invoiceNumber.trim() || invoice.invoice_number;

    // 4. Update invoice record
    const updatePayload: Record<string, unknown> = {
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
    };

    if (status === "sent" && invoice.status === "draft") {
      updatePayload.sent_at = new Date().toISOString();
    }

    const { error: invoiceError } = await supabase
      .schema("jdhome")
      .from("invoices")
      .update(updatePayload)
      .eq("id", invoice.id);

    if (invoiceError)
      throw new Error("Failed to update invoice: " + invoiceError.message);

    // 5. Replace line items: delete old, insert new
    const { error: deleteError } = await supabase
      .schema("jdhome")
      .from("invoice_items")
      .delete()
      .eq("invoice_id", invoice.id);

    if (deleteError)
      throw new Error("Failed to update line items: " + deleteError.message);

    const itemsToInsert = computedItems.map((item) => ({
      invoice_id: invoice.id,
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

    if (itemsError)
      throw new Error("Failed to save line items: " + itemsError.message);

    return {
      id: invoice.id,
      client: {
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone || null,
        address: formData.clientAddress || null,
        client_signature: formData.signatureDataUrl || null,
      },
      invoice: {
        invoice_number: finalInvoiceNumber,
        client_id: clientId,
        invoice_date: formData.invoiceDate,
        payment_method: formData.paymentMethod,
        notes: formData.notes || null,
        subtotal,
        hst_rate: 0.13,
        hst_amount: hstAmount,
        total,
        status,
      },
      invoice_items: itemsToInsert,
    };
  }

  async function handleSaveDraft(formData: InvoiceFormData) {
    setIsSaving(true);
    try {
      const result = await updateInvoice(formData, "draft");
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
      const result = await updateInvoice(formData, "sent");

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
    items: invoice.invoice_items.map((item) => ({
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
