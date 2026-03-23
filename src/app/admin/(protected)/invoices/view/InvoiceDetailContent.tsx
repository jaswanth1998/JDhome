"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Trash2,
  Clock,
  Send,
  Loader2,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  InvoicePreview,
  InvoiceStatusBadge,
} from "@/components/admin/invoices";
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
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
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

function formatTimestamp(ts: string | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function InvoiceDetailContent() {
  const { supabase } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        subtotal, hst_rate, hst_amount, total, status,
        sent_at, paid_at, created_at,
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

  async function handleSend() {
    if (!invoice) return;
    const action = invoice.status === "draft" ? "send" : "resend";
    setActionLoading(action);
    try {
      // Update status to sent if draft
      if (invoice.status === "draft") {
        const { error: updateError } = await supabase
          .schema("jdhome")
          .from("invoices")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", invoice.id);
        if (updateError) throw new Error("Failed to update invoice status");
      }

      // Call webhook to send invoice email
      const webhookRes = await fetch(
        "https://myn8n.plaper.org/webhook/a92a21d9-2c77-456a-b657-61694a39e1a0",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: {
              name: invoice.client.name,
              email: invoice.client.email,
              phone: invoice.client.phone,
              address: invoice.client.address,
              client_signature: invoice.client_signature,
            },
            invoice: {
              invoice_number: invoice.invoice_number,
              invoice_date: invoice.invoice_date,
              payment_method: invoice.payment_method,
              notes: invoice.notes,
              subtotal: invoice.subtotal,
              hst_rate: invoice.hst_rate,
              hst_amount: invoice.hst_amount,
              total: invoice.total,
              status: "sent",
            },
            invoice_items: invoice.invoice_items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
              sort_order: item.sort_order,
            })),
          }),
        }
      );

      if (!webhookRes.ok) {
        throw new Error("Failed to send invoice via webhook");
      }

      await fetchInvoice();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send invoice");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkPaid() {
    if (!invoice) return;
    setActionLoading("paid");
    await supabase
      .schema("jdhome")
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", invoice.id);
    await fetchInvoice();
    setActionLoading(null);
  }

  async function handleDelete() {
    if (!invoice) return;
    if (
      !confirm(
        `Delete invoice ${invoice.invoice_number}? This cannot be undone.`
      )
    )
      return;
    setActionLoading("delete");
    await supabase
      .schema("jdhome")
      .from("invoices")
      .delete()
      .eq("id", invoice.id);
    router.push("/admin/invoices");
  }

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
      </div>
    );
  }

  const previewData: InvoicePreviewData = {
    invoiceNumber: invoice.invoice_number,
    clientName: invoice.client.name,
    clientAddress: invoice.client.address ?? "",
    invoiceDate: invoice.invoice_date,
    paymentMethod: invoice.payment_method,
    items: invoice.invoice_items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      rate: i.rate,
      amount: i.amount,
    })),
    notes: invoice.notes ?? "",
    subtotal: invoice.subtotal,
    hstAmount: invoice.hst_amount,
    total: invoice.total,
    signatureDataUrl: invoice.client_signature ?? "",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/invoices")}
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {invoice.invoice_number}
              </h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">
              {invoice.client.name} &middot; {invoice.client.email}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {(invoice.status === "draft" || invoice.status === "sent") && (
            <button
              onClick={() => router.push(`/admin/invoices/edit?id=${invoice.id}`)}
              className="btn btn-sm bg-white text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)] border border-[var(--border-light)]"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}

          {invoice.status === "draft" && (
            <button
              onClick={handleSend}
              disabled={actionLoading === "send"}
              className="btn btn-primary btn-sm"
            >
              <Send className="w-4 h-4" />
              {actionLoading === "send" ? "Sending..." : "Send"}
            </button>
          )}

          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <button
              onClick={handleSend}
              disabled={actionLoading === "resend"}
              className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            >
              <Send className="w-4 h-4" />
              {actionLoading === "resend" ? "Resending..." : "Resend"}
            </button>
          )}

          {(invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "draft") && (
            <button
              onClick={handleMarkPaid}
              disabled={actionLoading === "paid"}
              className="btn btn-primary btn-sm"
            >
              <CheckCircle className="w-4 h-4" />
              {actionLoading === "paid" ? "..." : "Mark Paid"}
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={actionLoading === "delete"}
            className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            {actionLoading === "delete" ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Preview */}
        <div className="lg:col-span-2">
          <InvoicePreview data={previewData} />
        </div>

        {/* Timeline / Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-[var(--border-light)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Created</p>
                  <p className="text-sm font-medium">
                    {formatTimestamp(invoice.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Send className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Sent</p>
                  <p className="text-sm font-medium">
                    {formatTimestamp(invoice.sent_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Paid</p>
                  <p className="text-sm font-medium">
                    {formatTimestamp(invoice.paid_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[var(--border-light)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Client Details
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-[var(--text-muted)]">Name:</span>{" "}
                <span className="font-medium">{invoice.client.name}</span>
              </p>
              <p>
                <span className="text-[var(--text-muted)]">Email:</span>{" "}
                <span className="font-medium">{invoice.client.email}</span>
              </p>
              {invoice.client.phone && (
                <p>
                  <span className="text-[var(--text-muted)]">Phone:</span>{" "}
                  <span className="font-medium">{invoice.client.phone}</span>
                </p>
              )}
              {invoice.client.address && (
                <p>
                  <span className="text-[var(--text-muted)]">Address:</span>{" "}
                  <span className="font-medium">{invoice.client.address}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
