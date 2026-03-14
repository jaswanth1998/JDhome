"use client";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700",
  },
  sent: {
    label: "Sent",
    className: "bg-blue-100 text-blue-700",
  },
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-700",
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-700",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-400",
  },
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "paid"
            ? "bg-green-500"
            : status === "sent"
            ? "bg-blue-500"
            : status === "overdue"
            ? "bg-red-500"
            : status === "cancelled"
            ? "bg-gray-400"
            : "bg-gray-500"
        }`}
      />
      {config.label}
    </span>
  );
}
