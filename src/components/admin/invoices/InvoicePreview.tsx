"use client";

export type InvoicePreviewData = {
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  invoiceDate: string;
  paymentMethod: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  notes: string;
  subtotal: number;
  hstAmount: number;
  total: number;
  signatureDataUrl?: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function InvoicePreview({ data }: { data: InvoicePreviewData }) {
  return (
    <div className="bg-white border border-[var(--border-light)] rounded-lg shadow-sm w-full max-w-[650px] mx-auto text-sm">
      {/* Header */}
      <div className="bg-[var(--primary-main)] text-white px-4 sm:px-8 py-4 sm:py-6 rounded-t-lg">
        <h2
          className="text-xl sm:text-2xl font-bold tracking-wide mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          JD HOME
        </h2>
        <p className="text-[10px] sm:text-xs tracking-widest uppercase opacity-80 mb-3 sm:mb-4">
          From Install to Repair. Finished to Perfection.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[10px] sm:text-xs opacity-90">
          <div>
            <span className="opacity-70">Phone:</span> +1 (289) 991-3277
          </div>
          <div>
            <span className="opacity-70">Email:</span>{" "}
            17508336canadainc@gmail.com
          </div>
          <div>
            <span className="opacity-70">Web:</span> www.Jdhomeservices.ca
          </div>
          <div>
            <span className="opacity-70">Address:</span> Barrie, Ontario
          </div>
          <div>
            <span className="opacity-70">GST/HST:</span> 2000 2161 RT0001
          </div>
        </div>
      </div>

      {/* Invoice Title + Number */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 border-b border-[var(--border-light)] flex items-center justify-between">
        <h3
          className="text-lg sm:text-xl font-bold text-[var(--primary-main)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          INVOICE
        </h3>
        <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
          No. {data.invoiceNumber || "—"}
        </span>
      </div>

      {/* Bill To + Invoice Info */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 border-b border-[var(--border-light)] grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Bill To
          </p>
          <p className="font-semibold text-[var(--text-primary)]">
            {data.clientName || "—"}
          </p>
          <p className="text-[var(--text-secondary)] text-xs whitespace-pre-line">
            {data.clientAddress || "—"}
          </p>
        </div>
        <div className="sm:text-right space-y-2">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Invoice Date:</p>
            <p className="font-medium text-[var(--text-primary)]">
              {formatDate(data.invoiceDate) || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Payment Method:</p>
            <p className="font-medium text-[var(--text-primary)]">
              {data.paymentMethod || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items Table - Desktop */}
      <div className="hidden sm:block px-4 sm:px-8 py-3 sm:py-4 border-b border-[var(--border-light)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--primary-main)]">
              <th className="text-left py-2 font-semibold text-[var(--primary-main)]">
                Description
              </th>
              <th className="text-center py-2 font-semibold text-[var(--primary-main)] w-16">
                Qty
              </th>
              <th className="text-right py-2 font-semibold text-[var(--primary-main)] w-24">
                Rate
              </th>
              <th className="text-right py-2 font-semibold text-[var(--primary-main)] w-24">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-4 text-center text-[var(--text-muted)]"
                >
                  No items added
                </td>
              </tr>
            )}
            {data.items.map((item, i) => (
              <tr
                key={i}
                className="border-b border-[var(--border-light)] last:border-b-0"
              >
                <td className="py-2 text-[var(--text-primary)]">
                  {item.description || "—"}
                </td>
                <td className="py-2 text-center text-[var(--text-secondary)]">
                  {item.quantity || 0}
                </td>
                <td className="py-2 text-right text-[var(--text-secondary)]">
                  {formatCurrency(item.rate || 0)}
                </td>
                <td className="py-2 text-right font-medium text-[var(--text-primary)]">
                  {formatCurrency(item.amount || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Line Items - Mobile card layout */}
      <div className="sm:hidden px-4 py-3 border-b border-[var(--border-light)]">
        <p className="text-xs font-semibold text-[var(--primary-main)] uppercase tracking-wider mb-2 pb-1 border-b-2 border-[var(--primary-main)]">
          Items
        </p>
        {data.items.length === 0 && (
          <p className="py-4 text-center text-[var(--text-muted)]">
            No items added
          </p>
        )}
        {data.items.map((item, i) => (
          <div
            key={i}
            className="py-2 border-b border-[var(--border-light)] last:border-b-0"
          >
            <p className="text-[var(--text-primary)] font-medium text-xs">
              {item.description || "—"}
            </p>
            <div className="flex justify-between mt-1 text-[11px]">
              <span className="text-[var(--text-muted)]">
                {item.quantity || 0} x {formatCurrency(item.rate || 0)}
              </span>
              <span className="font-medium text-[var(--text-primary)]">
                {formatCurrency(item.amount || 0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Notes + Totals */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 border-b border-[var(--border-light)]">
        <div>
          {data.notes && (
            <>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Notes
              </p>
              <p className="text-xs text-[var(--text-secondary)] whitespace-pre-line">
                {data.notes}
              </p>
            </>
          )}
        </div>
        <div className="space-y-1 sm:text-right">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Subtotal</span>
            <span className="font-medium">
              {formatCurrency(data.subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">HST (13%)</span>
            <span className="font-medium">
              {formatCurrency(data.hstAmount)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[var(--border-light)]">
            <span className="font-bold text-[var(--primary-main)]">
              TOTAL DUE
            </span>
            <span className="font-bold text-base sm:text-lg text-[var(--primary-main)]">
              {formatCurrency(data.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Client Signature */}
      {data.signatureDataUrl && (
        <div className="px-4 sm:px-8 py-3 sm:py-4 border-b border-[var(--border-light)]">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Client Signature
          </p>
          <div className="border-b border-[var(--text-muted)] pb-1 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.signatureDataUrl}
              alt="Client signature"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 text-center rounded-b-lg bg-[var(--neutral-lightest-gray)]">
        <p className="text-[10px] sm:text-xs tracking-widest uppercase text-[var(--text-muted)] mb-1">
          From Install to Repair. Finished to Perfection.
        </p>
        <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">
          Thank you for choosing JD Home. We appreciate your business.
        </p>
        <p className="text-[10px] sm:text-xs font-semibold text-[var(--primary-main)] mt-1">
          TRUSTED LOCAL EXPERTS
        </p>
      </div>
    </div>
  );
}
