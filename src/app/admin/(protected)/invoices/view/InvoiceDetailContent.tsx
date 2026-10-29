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
  Download,
  Link2,
  Check,
} from "lucide-react";
import {
  InvoiceStatusBadge,
  UploadedPdfViewer,
} from "@/components/admin/invoices";
import { downloadUploadedInvoice } from "@/lib/pdf/uploadedInvoice";
import {
  sendDocument,
  downloadDocumentPdf,
  toInvoiceDocument,
  DocumentPdfViewer,
} from "@/lib/pdf";
import {
  deleteInvoice,
  getClient,
  getInvoice,
  nowIso,
  setInvoiceStatus,
  type Client,
  type Invoice,
} from "@/lib/db";

/** The invoice document joined (in memory) to its client. */
type InvoiceDetail = Invoice & { client: Client };

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  async function handleSend() {
    if (!invoice) return;
    const action = invoice.status === "draft" ? "send" : "resend";
    setActionLoading(action);
    try {
      // Update status to sent if draft
      if (invoice.status === "draft") {
        try {
          await setInvoiceStatus(invoice.id, "sent", { sent_at: nowIso() });
        } catch {
          throw new Error("Failed to update invoice status");
        }
      }

      // Render the PDF in the browser, then hand it to n8n to email
      await sendDocument(
        toInvoiceDocument(invoice, invoice.client, invoice.items)
      );

      await fetchInvoice();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send invoice");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCopyShareLink() {
    if (!invoice) return;
    const url = `${window.location.origin}/share/?token=${invoice.public_token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard needs a secure context; show the link so it can be copied.
      prompt("Copy this link:", url);
    }
  }

  async function handleDownload() {
    if (!invoice) return;
    setActionLoading("download");
    try {
      if (invoice.pdf_name) {
        await downloadUploadedInvoice(invoice.id, invoice.invoice_number);
        return;
      }
      // Render the PDF in the browser and save it locally
      await downloadDocumentPdf(
        toInvoiceDocument(invoice, invoice.client, invoice.items)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to download invoice");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkPaid() {
    if (!invoice) return;
    setActionLoading("paid");
    try {
      await setInvoiceStatus(invoice.id, "paid", { paid_at: nowIso() });
      await fetchInvoice();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update invoice");
    } finally {
      setActionLoading(null);
    }
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
    try {
      // Also removes the public share copy and any uploaded PDF
      await deleteInvoice(invoice.id);
      router.push("/admin/invoices");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete invoice");
      setActionLoading(null);
    }
  }

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
      </div>
    );
  }


  // Uploaded invoices have no line items and were sent outside the app, so
  // editing, emailing and the public share link do not apply to them.
  const isUploaded = !!invoice.pdf_name;

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
              {isUploaded && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--neutral-light-gray)] text-[var(--text-muted)]">
                  Uploaded PDF
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">
              {invoice.client.name} &middot; {invoice.client.email}
            </p>
            {invoice.sent_from_company && (
              <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">
                Sent from {invoice.sent_from_company}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {/* Available for every status — a paid invoice may still need a
              correction (wrong address, typo in a line item). */}
          {!isUploaded && (
            <button
              onClick={() => router.push(`/admin/invoices/edit?id=${invoice.id}`)}
              className="btn btn-sm bg-white text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)] border border-[var(--border-light)]"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}

          {!isUploaded && invoice.status === "draft" && (
            <button
              onClick={handleSend}
              disabled={actionLoading === "send"}
              className="btn btn-primary btn-sm"
            >
              <Send className="w-4 h-4" />
              {actionLoading === "send" ? "Sending..." : "Send"}
            </button>
          )}

          {!isUploaded &&
            (invoice.status === "sent" || invoice.status === "overdue") && (
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

          {!isUploaded && (
          <button
            onClick={handleCopyShareLink}
            className="btn btn-sm bg-white text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)] border border-[var(--border-light)]"
            title="Public link the client can open without logging in"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </button>
          )}

          <button
            onClick={handleDownload}
            disabled={actionLoading === "download"}
            className="btn btn-sm bg-white text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)] border border-[var(--border-light)]"
          >
            <Download className="w-4 h-4" />
            {actionLoading === "download" ? "Preparing..." : "Download PDF"}
          </button>

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
        {/* Invoice Preview — the actual PDF the client receives */}
        <div className="lg:col-span-2">
          {invoice.pdf_name ? (
            <UploadedPdfViewer invoiceId={invoice.id} />
          ) : (
            <DocumentPdfViewer
              data={toInvoiceDocument(
                invoice,
                invoice.client,
                invoice.items
              )}
            />
          )}
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
