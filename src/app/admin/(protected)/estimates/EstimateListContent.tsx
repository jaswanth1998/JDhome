"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { EstimateStatusBadge } from "@/components/admin/estimates";

type Estimate = {
  id: string;
  estimate_number: string;
  estimate_date: string;
  total: number;
  status: string;
  client: { name: string } | null;
};

const STATUS_TABS = ["all", "draft", "sent", "accepted", "declined", "expired"] as const;

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

export default function EstimateListContent() {
  const { supabase } = useAuth();
  const router = useRouter();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .schema("jdhome")
      .from("estimates")
      .select("id, estimate_number, estimate_date, total, status, client:clients(name)")
      .order("created_at", { ascending: false });

    if (activeTab !== "all") {
      query = query.eq("status", activeTab);
    }

    const { data } = await query;
    setEstimates((data as unknown as Estimate[]) ?? []);
    setLoading(false);
  }, [supabase, activeTab]);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  const filtered = searchQuery
    ? estimates.filter(
        (est) =>
          est.estimate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          est.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : estimates;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Estimates
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Create, send, and track estimates
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/estimates/new")}
          className="btn btn-primary btn-sm"
        >
          <Plus className="w-4 h-4" />
          New Estimate
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
            placeholder="Search estimates..."
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
            {estimates.length === 0
              ? "No estimates yet"
              : "No estimates match your search"}
          </p>
          {estimates.length === 0 && (
            <button
              onClick={() => router.push("/admin/estimates/new")}
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-4 h-4" />
              Create your first estimate
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
                </tr>
              </thead>
              <tbody>
                {filtered.map((est) => (
                  <tr
                    key={est.id}
                    onClick={() => router.push(`/admin/estimates/view?id=${est.id}`)}
                    className="border-b border-[var(--border-light)] last:border-b-0 hover:bg-[var(--neutral-lightest-gray)] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      {est.estimate_number}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {est.client?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {formatDate(est.estimate_date)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">
                      {formatCurrency(est.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EstimateStatusBadge status={est.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-2">
            {filtered.map((est) => (
              <div
                key={est.id}
                onClick={() => router.push(`/admin/estimates/view?id=${est.id}`)}
                className="bg-white rounded-lg border border-[var(--border-light)] p-3 cursor-pointer active:bg-[var(--neutral-lightest-gray)] transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {est.estimate_number}
                  </span>
                  <EstimateStatusBadge status={est.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {est.client?.name ?? "—"}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {formatCurrency(est.total)}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {formatDate(est.estimate_date)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
