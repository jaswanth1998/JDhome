"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Home, Users, Wrench, FileText, DollarSign } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { theme } from "@/config/theme";

type InvoiceStats = {
  total: number;
  drafts: number;
  unpaidTotal: number;
};

const staticCards = [
  {
    label: "Services Offered",
    value: theme.services.categories.length.toString(),
    icon: Wrench,
    color: "var(--accent-teal)",
  },
  {
    label: "Service Areas",
    value: theme.contact.address.fullServiceArea.split(",").length.toString(),
    icon: Home,
    color: "var(--primary-main)",
  },
  {
    label: "Testimonials",
    value: theme.testimonials.length.toString(),
    icon: Users,
    color: "var(--accent-orange)",
  },
];

export default function DashboardPage() {
  const { profile, supabase } = useAuth();
  const router = useRouter();
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats>({ total: 0, drafts: 0, unpaidTotal: 0 });

  const fetchStats = useCallback(async () => {
    const { data } = await supabase
      .schema("jdhome")
      .from("invoices")
      .select("status, total");
    if (data) {
      const total = data.length;
      const drafts = data.filter((i: { status: string }) => i.status === "draft").length;
      const unpaidTotal = data
        .filter((i: { status: string }) => i.status === "sent" || i.status === "overdue")
        .reduce((sum: number, i: { total: number }) => sum + Number(i.total), 0);
      setInvoiceStats({ total, drafts, unpaidTotal });
    }
  }, [supabase]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Welcome back, {profile?.username || profile?.email?.split("@")[0]}
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          JD Home Services Admin Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {staticCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-[var(--border-light)] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-muted)]">
                {card.label}
              </span>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: card.color, opacity: 0.1 }}
              >
                <card.icon
                  className="w-5 h-5"
                  style={{ color: card.color }}
                />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {card.value}
            </p>
          </div>
        ))}

        {/* Invoice stats */}
        <div
          className="bg-white rounded-xl border border-[var(--border-light)] p-5 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push("/admin/invoices")}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--text-muted)]">
              Invoices
            </span>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--state-info)", opacity: 0.1 }}
            >
              <FileText className="w-5 h-5" style={{ color: "var(--state-info)" }} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {invoiceStats.total}
          </p>
          {invoiceStats.drafts > 0 && (
            <p className="text-xs text-[var(--text-muted)] mt-1">{invoiceStats.drafts} draft{invoiceStats.drafts > 1 ? "s" : ""}</p>
          )}
        </div>

        <div
          className="bg-white rounded-xl border border-[var(--border-light)] p-5 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push("/admin/invoices")}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--text-muted)]">
              Unpaid Total
            </span>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-orange)", opacity: 0.1 }}
            >
              <DollarSign className="w-5 h-5" style={{ color: "var(--accent-orange)" }} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {invoiceStats.unpaidTotal.toLocaleString("en-CA", { style: "currency", currency: "CAD" })}
          </p>
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-white rounded-xl border border-[var(--border-light)] p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Website Status
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
            <span className="text-sm text-[var(--text-muted)]">Site URL</span>
            <span className="text-sm font-medium text-[var(--accent-teal)]">
              {theme.seo.siteUrl}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
            <span className="text-sm text-[var(--text-muted)]">
              Contact Email
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {theme.contact.email}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
            <span className="text-sm text-[var(--text-muted)]">
              Phone
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {theme.contact.phone.display}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[var(--text-muted)]">
              Service Area
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {theme.contact.address.serviceArea}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
