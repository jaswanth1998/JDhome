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
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-700",
  },
  declined: {
    label: "Declined",
    className: "bg-red-100 text-red-700",
  },
  expired: {
    label: "Expired",
    className: "bg-orange-100 text-orange-700",
  },
};

export function EstimateStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "accepted"
            ? "bg-green-500"
            : status === "sent"
            ? "bg-blue-500"
            : status === "declined"
            ? "bg-red-500"
            : status === "expired"
            ? "bg-orange-500"
            : "bg-gray-500"
        }`}
      />
      {config.label}
    </span>
  );
}
