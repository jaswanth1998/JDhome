"use client";

import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

type SummaryInvoice = {
  id: string;
  invoice_number: string;
  pdf_url: string | null;
  client: { name: string } | null;
  invoice_date: string;
  subtotal: number;
  hst_amount: number;
  total: number;
  status: string;
};

type MonthRow = {
  month: string; // YYYY-MM
  count: number;
  drafts: number;
  subtotal: number;
  hst: number;
  total: number;
  paid: number;
  outstanding: number;
  invoices: SummaryInvoice[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

function formatMonth(month: string) {
  return new Date(month + "-01T00:00:00").toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
  });
}

/** Drafts are counted separately — they are not billed yet, so they stay out of the money columns. */
function summarize(invoices: SummaryInvoice[]): MonthRow[] {
  const byMonth = new Map<string, MonthRow>();
  for (const inv of invoices) {
    const month = inv.invoice_date.slice(0, 7);
    let row = byMonth.get(month);
    if (!row) {
      row = {
        month,
        count: 0,
        drafts: 0,
        subtotal: 0,
        hst: 0,
        total: 0,
        paid: 0,
        outstanding: 0,
        invoices: [],
      };
      byMonth.set(month, row);
    }
    row.invoices.push(inv);
    if (inv.status === "draft") {
      row.drafts += 1;
      continue;
    }
    row.count += 1;
    row.subtotal += Number(inv.subtotal);
    row.hst += Number(inv.hst_amount);
    row.total += Number(inv.total);
    if (inv.status === "paid") row.paid += Number(inv.total);
    else row.outstanding += Number(inv.total);
  }
  return [...byMonth.values()].sort((a, b) => b.month.localeCompare(a.month));
}

function downloadCsv(rows: MonthRow[]) {
  const header = "Month,Invoices,Drafts,Subtotal,HST,Total,Paid,Outstanding";
  const lines = rows.map((r) =>
    [
      r.month,
      r.count,
      r.drafts,
      r.subtotal.toFixed(2),
      r.hst.toFixed(2),
      r.total.toFixed(2),
      r.paid.toFixed(2),
      r.outstanding.toFixed(2),
    ].join(","),
  );
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "invoice-monthly-summary.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function MonthlySummary() {
  const { supabase } = useAuth();
  const router = useRouter();
  // Months the user has collapsed — everything starts expanded
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const toggle = (month: string) =>
    setClosed((cur) => {
      const next = new Set(cur);
      if (!next.delete(month)) next.add(month);
      return next;
    });
  const [rows, setRows] = useState<MonthRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .schema("jdhome")
        .from("invoices")
        .select(
          "id, invoice_number, invoice_date, subtotal, hst_amount, total, status, pdf_url, client:clients(name)",
        )
        .order("invoice_date", { ascending: false });
      if (cancelled) return;
      setRows(summarize((data as unknown as SummaryInvoice[]) ?? []));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner text-[var(--accent-teal)]" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-[var(--border-light)]">
        <p className="text-[var(--text-muted)]">No invoices yet</p>
      </div>
    );
  }

  const grand = rows.reduce(
    (acc, r) => ({
      count: acc.count + r.count,
      subtotal: acc.subtotal + r.subtotal,
      hst: acc.hst + r.hst,
      total: acc.total + r.total,
      paid: acc.paid + r.paid,
      outstanding: acc.outstanding + r.outstanding,
    }),
    { count: 0, subtotal: 0, hst: 0, total: 0, paid: 0, outstanding: 0 },
  );

  const th =
    "px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[var(--text-muted)]">
          Drafts are not included in the amounts. Tap a month to show its
          invoices.
        </p>
        <button
          onClick={() => downloadCsv(rows)}
          className="btn btn-outline btn-sm shrink-0"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-lg border border-[var(--border-light)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-[var(--neutral-lightest-gray)]">
              <th className={`text-left ${th}`}>Month</th>
              <th className={`text-right ${th}`}>Invoices</th>
              <th className={`text-right ${th}`}>Subtotal</th>
              <th className={`text-right ${th}`}>HST</th>
              <th className={`text-right ${th}`}>Total</th>
              <th className={`text-right ${th}`}>Paid</th>
              <th className={`text-right ${th}`}>Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Fragment key={r.month}>
                <tr
                  onClick={() => toggle(r.month)}
                  className="border-b border-[var(--border-light)] hover:bg-[var(--neutral-lightest-gray)] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                    <span className="inline-flex items-center gap-1.5">
                      {!closed.has(r.month) ? (
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                      )}
                      {formatMonth(r.month)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                    {r.count}
                    {r.drafts > 0 && (
                      <span className="text-xs text-[var(--text-muted)]">
                        {" "}
                        +{r.drafts} draft{r.drafts > 1 ? "s" : ""}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                    {formatCurrency(r.subtotal)}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                    {formatCurrency(r.hst)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">
                    {formatCurrency(r.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-700">
                    {formatCurrency(r.paid)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right ${
                      r.outstanding > 0
                        ? "text-amber-700"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {formatCurrency(r.outstanding)}
                  </td>
                </tr>
                {!closed.has(r.month) &&
                  r.invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() =>
                        router.push(`/admin/invoices/view?id=${inv.id}`)
                      }
                      className="border-b border-[var(--border-light)] bg-[var(--neutral-lightest-gray)] hover:bg-[var(--neutral-light-gray)] cursor-pointer transition-colors text-xs"
                    >
                      <td className="pl-10 pr-4 py-2 text-[var(--text-primary)]">
                        {inv.invoice_number}
                        {inv.pdf_url && (
                          <span className="text-[var(--text-muted)]">
                            {" "}
                            · uploaded
                          </span>
                        )}
                        <span className="text-[var(--text-muted)]">
                          {" · "}
                          {formatDate(inv.invoice_date)}
                        </span>
                      </td>
                      <td
                        colSpan={2}
                        className="px-4 py-2 text-right text-[var(--text-secondary)]"
                      >
                        {inv.client?.name ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-right text-[var(--text-secondary)]">
                        {formatCurrency(inv.hst_amount)}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-[var(--text-primary)]">
                        {formatCurrency(inv.total)}
                      </td>
                      <td colSpan={2} className="px-4 py-2 text-right">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
              </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[var(--neutral-lightest-gray)] font-semibold text-[var(--text-primary)]">
              <td className="px-4 py-3">All time</td>
              <td className="px-4 py-3 text-right">{grand.count}</td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(grand.subtotal)}
              </td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(grand.hst)}
              </td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(grand.total)}
              </td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(grand.paid)}
              </td>
              <td className="px-4 py-3 text-right">
                {formatCurrency(grand.outstanding)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {rows.map((r) => (
          <div
            key={r.month}
            onClick={() => toggle(r.month)}
            className="bg-white rounded-lg border border-[var(--border-light)] p-3 cursor-pointer active:bg-[var(--neutral-lightest-gray)] transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {formatMonth(r.month)}
              </span>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {formatCurrency(r.total)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>
                {r.count} invoice{r.count === 1 ? "" : "s"}
                {r.drafts > 0 &&
                  ` +${r.drafts} draft${r.drafts > 1 ? "s" : ""}`}
                {" · "}HST {formatCurrency(r.hst)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-green-700">
                Paid {formatCurrency(r.paid)}
              </span>
              <span
                className={
                  r.outstanding > 0
                    ? "text-amber-700"
                    : "text-[var(--text-muted)]"
                }
              >
                Outstanding {formatCurrency(r.outstanding)}
              </span>
            </div>
            {!closed.has(r.month) && (
              <div className="mt-2 pt-2 border-t border-[var(--border-light)] space-y-1.5">
                {r.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/invoices/view?id=${inv.id}`);
                    }}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="min-w-0 truncate text-[var(--text-secondary)]">
                      <span className="font-medium text-[var(--text-primary)]">
                        {inv.invoice_number}
                        {inv.pdf_url && (
                          <span className="text-[var(--text-muted)]">
                            {" "}
                            · uploaded
                          </span>
                        )}
                      </span>
                      {" · "}
                      {inv.client?.name ?? "—"}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {formatCurrency(inv.total)}
                      <InvoiceStatusBadge status={inv.status} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="bg-[var(--neutral-lightest-gray)] rounded-lg border border-[var(--border-light)] p-3 text-sm font-semibold text-[var(--text-primary)] flex items-center justify-between">
          <span>All time · {grand.count}</span>
          <span>{formatCurrency(grand.total)}</span>
        </div>
      </div>
    </div>
  );
}
