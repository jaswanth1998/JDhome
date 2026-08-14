"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  FileText,
  Pencil,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { InvoiceStatusBadge } from "@/components/admin/invoices";
import { downloadDocumentPdf, toInvoiceDocument } from "@/lib/pdf";

type Invoice = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  total: number;
  status: string;
  client: { name: string } | null;
};

/** Full record the PDF needs — the list query only selects a summary. */
type InvoiceFull = {
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

const STATUS_TABS = ["all", "draft", "sent", "paid", "overdue"] as const;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function InvoiceListContent() {
  const { supabase } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowBusy, setRowBusy] = useState<{
    id: string;
    action: "download" | "delete";
  } | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .schema("jdhome")
      .from("invoices")
      .select("id, invoice_number, invoice_date, total, status, client:clients(name)")
      .order("created_at", { ascending: false });

    if (activeTab !== "all") {
      query = query.eq("status", activeTab);
    }

    const { data } = await query;
    setInvoices((data as unknown as Invoice[]) ?? []);
    setLoading(false);
  }, [supabase, activeTab]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  async function handleDownload(id: string) {
    setRowBusy({ id, action: "download" });
    try {
      // The list only holds a summary — pull the full record the PDF needs
      const { data, error } = await supabase
        .schema("jdhome")
        .from("invoices")
        .select(
          `
          id, invoice_number, invoice_date, payment_method, notes, client_signature,
          subtotal, hst_rate, hst_amount, total, status,
          client:clients(name, email, phone, address),
          invoice_items(description, quantity, rate, amount, sort_order)
        `
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Failed to load invoice");
        return;
      }

      const inv = data as unknown as InvoiceFull;
      inv.invoice_items.sort((a, b) => a.sort_order - b.sort_order);

      // Render the PDF in the browser and save it locally
      await downloadDocumentPdf(
        toInvoiceDocument(inv, inv.client, inv.invoice_items)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to download invoice");
    } finally {
      setRowBusy(null);
    }
  }

  async function handleDelete(id: string, invoiceNumber: string) {
    if (!confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`))
      return;
    setRowBusy({ id, action: "delete" });
    try {
      const { error } = await supabase
        .schema("jdhome")
        .from("invoices")
        .delete()
        .eq("id", id);
      if (error) throw new Error("Failed to delete invoice");
      await fetchInvoices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete invoice");
    } finally {
      setRowBusy(null);
    }
  }

  const filtered = searchQuery
    ? invoices.filter(
        (inv) =>
          inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : invoices;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Invoices
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Create, send, and track invoices
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/invoices/new")}
          className="btn btn-primary btn-sm"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex gap-1 bg-[var(--neutral-light-gray)] rounded-lg p-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "bg-white text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            className="input !h-9 text-sm !pl-9"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner text-[var(--accent-teal)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-[var(--border-light)]">
          <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
          <p className="text-[var(--text-muted)] mb-4">
            {invoices.length === 0
              ? "No invoices yet"
              : "No invoices match your search"}
          </p>
          {invoices.length === 0 && (
            <button
              onClick={() => router.push("/admin/invoices/new")}
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-4 h-4" />
              Create your first invoice
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-lg border border-[var(--border-light)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--neutral-lightest-gray)]">
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    Number
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => router.push(`/admin/invoices/view?id=${inv.id}`)}
                    className="border-b border-[var(--border-light)] last:border-b-0 hover:bg-[var(--neutral-lightest-gray)] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {inv.client?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {formatDate(inv.invoice_date)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/invoices/edit?id=${inv.id}`);
                          }}
                          disabled={rowBusy?.id === inv.id}
                          className="p-1.5 rounded hover:bg-[var(--neutral-light-gray)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          title="Download PDF"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(inv.id);
                          }}
                          disabled={rowBusy?.id === inv.id}
                          className="p-1.5 rounded hover:bg-[var(--neutral-light-gray)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
                        >
                          {rowBusy?.id === inv.id &&
                          rowBusy.action === "download" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(inv.id, inv.invoice_number);
                          }}
                          disabled={rowBusy?.id === inv.id}
                          className="p-1.5 rounded hover:bg-red-50 text-[var(--text-muted)] hover:text-red-600 transition-colors disabled:opacity-40"
                        >
                          {rowBusy?.id === inv.id &&
                          rowBusy.action === "delete" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-2">
            {filtered.map((inv) => (
              <div
                key={inv.id}
                onClick={() => router.push(`/admin/invoices/view?id=${inv.id}`)}
                className="bg-white rounded-lg border border-[var(--border-light)] p-3 cursor-pointer active:bg-[var(--neutral-lightest-gray)] transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {inv.invoice_number}
                  </span>
                  <InvoiceStatusBadge status={inv.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {inv.client?.name ?? "—"}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {formatCurrency(inv.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatDate(inv.invoice_date)}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/invoices/edit?id=${inv.id}`);
                      }}
                      disabled={rowBusy?.id === inv.id}
                      className="p-1.5 rounded hover:bg-[var(--neutral-light-gray)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      title="Download PDF"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(inv.id);
                      }}
                      disabled={rowBusy?.id === inv.id}
                      className="p-1.5 rounded hover:bg-[var(--neutral-light-gray)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
                    >
                      {rowBusy?.id === inv.id &&
                      rowBusy.action === "download" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(inv.id, inv.invoice_number);
                      }}
                      disabled={rowBusy?.id === inv.id}
                      className="p-1.5 rounded hover:bg-red-50 text-[var(--text-muted)] hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      {rowBusy?.id === inv.id && rowBusy.action === "delete" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
