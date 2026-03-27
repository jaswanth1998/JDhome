"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  Send,
  Loader2,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  EstimatePreview,
  EstimateStatusBadge,
} from "@/components/admin/estimates";
import type { EstimatePreviewData } from "@/components/admin/estimates/EstimatePreview";
//TODO: Move this to env vars and backend config
const ESTIMATE_WEBHOOK_URL = "ESTIMATE_WEBHOOK_PLACEHOLDER";

type EstimateDetail = {
  id: string;
  estimate_number: string;
  estimate_date: string;
  valid_until: string | null;
  payment_method: string;
  notes: string | null;
  client_signature: string | null;
  subtotal: number;
  hst_rate: number;
  hst_amount: number;
  total: number;
  status: string;
  sent_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  created_at: string;
  client: {
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
  };
  estimate_items: {
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

export default function EstimateDetailContent() {
  const { supabase } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [estimate, setEstimate] = useState<EstimateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchEstimate = useCallback(async () => {
    if (!id) {
      router.push("/admin/estimates");
      return;
    }
    const { data, error } = await supabase
      .schema("jdhome")
      .from("estimates")
      .select(
        `
        id, estimate_number, estimate_date, valid_until, payment_method, notes, client_signature,
        subtotal, hst_rate, hst_amount, total, status,
        sent_at, accepted_at, declined_at, created_at,
        client:clients(name, email, phone, address),
        estimate_items(description, quantity, rate, amount, sort_order)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      router.push("/admin/estimates");
      return;
    }

    const est = data as unknown as EstimateDetail;
    est.estimate_items.sort((a, b) => a.sort_order - b.sort_order);
    setEstimate(est);
    setLoading(false);
  }, [supabase, id, router]);

  useEffect(() => {
    fetchEstimate();
  }, [fetchEstimate]);

  async function handleSend() {
    if (!estimate) return;
    const action = estimate.status === "draft" ? "send" : "resend";
    setActionLoading(action);
    try {
      if (estimate.status === "draft") {
        const { error: updateError } = await supabase
          .schema("jdhome")
          .from("estimates")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", estimate.id);
        if (updateError) throw new Error("Failed to update estimate status");
      }

      const webhookRes = await fetch(ESTIMATE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: {
            name: estimate.client.name,
            email: estimate.client.email,
            phone: estimate.client.phone,
            address: estimate.client.address,
            client_signature: estimate.client_signature,
          },
          estimate: {
            estimate_number: estimate.estimate_number,
            estimate_date: estimate.estimate_date,
            valid_until: estimate.valid_until,
            payment_method: estimate.payment_method,
            notes: estimate.notes,
            subtotal: estimate.subtotal,
            hst_rate: estimate.hst_rate,
            hst_amount: estimate.hst_amount,
            total: estimate.total,
            status: "sent",
          },
          estimate_items: estimate.estimate_items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            sort_order: item.sort_order,
          })),
        }),
      });

      if (!webhookRes.ok) {
        throw new Error("Failed to send estimate via webhook");
      }

      await fetchEstimate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send estimate");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkAccepted() {
    if (!estimate) return;
    setActionLoading("accepted");
    await supabase
      .schema("jdhome")
      .from("estimates")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", estimate.id);
    await fetchEstimate();
    setActionLoading(null);
  }

  async function handleMarkDeclined() {
    if (!estimate) return;
    setActionLoading("declined");
    await supabase
      .schema("jdhome")
      .from("estimates")
      .update({ status: "declined", declined_at: new Date().toISOString() })
      .eq("id", estimate.id);
    await fetchEstimate();
    setActionLoading(null);
  }

  async function handleDelete() {
    if (!estimate) return;
    if (
      !confirm(
        `Delete estimate ${estimate.estimate_number}? This cannot be undone.`
      )
    )
      return;
    setActionLoading("delete");
    await supabase
      .schema("jdhome")
      .from("estimates")
      .delete()
      .eq("id", estimate.id);
    router.push("/admin/estimates");
  }

  if (loading || !estimate) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
      </div>
    );
  }

  const previewData: EstimatePreviewData = {
    estimateNumber: estimate.estimate_number,
    clientName: estimate.client.name,
    clientAddress: estimate.client.address ?? "",
    estimateDate: estimate.estimate_date,
    validUntil: estimate.valid_until ?? "",
    paymentMethod: estimate.payment_method,
    items: estimate.estimate_items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      rate: i.rate,
      amount: i.amount,
    })),
    notes: estimate.notes ?? "",
    subtotal: estimate.subtotal,
    hstAmount: estimate.hst_amount,
    total: estimate.total,
    signatureDataUrl: estimate.client_signature ?? "",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/estimates")}
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {estimate.estimate_number}
              </h1>
              <EstimateStatusBadge status={estimate.status} />
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">
              {estimate.client.name} &middot; {estimate.client.email}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {(estimate.status === "draft" || estimate.status === "sent") && (
            <button
              onClick={() => router.push(`/admin/estimates/edit?id=${estimate.id}`)}
              className="btn btn-sm bg-white text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)] border border-[var(--border-light)]"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}

          {estimate.status === "draft" && (
            <button
              onClick={handleSend}
              disabled={actionLoading === "send"}
              className="btn btn-primary btn-sm"
            >
              <Send className="w-4 h-4" />
              {actionLoading === "send" ? "Sending..." : "Send"}
            </button>
          )}

          {estimate.status === "sent" && (
            <button
              onClick={handleSend}
              disabled={actionLoading === "resend"}
              className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            >
              <Send className="w-4 h-4" />
              {actionLoading === "resend" ? "Resending..." : "Resend"}
            </button>
          )}

          {(estimate.status === "sent" || estimate.status === "draft") && (
            <button
              onClick={handleMarkAccepted}
              disabled={actionLoading === "accepted"}
              className="btn btn-sm bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
            >
              <CheckCircle className="w-4 h-4" />
              {actionLoading === "accepted" ? "..." : "Accept"}
            </button>
          )}

          {(estimate.status === "sent" || estimate.status === "draft") && (
            <button
              onClick={handleMarkDeclined}
              disabled={actionLoading === "declined"}
              className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            >
              <XCircle className="w-4 h-4" />
              {actionLoading === "declined" ? "..." : "Decline"}
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
        {/* Estimate Preview */}
        <div className="lg:col-span-2">
          <EstimatePreview data={previewData} />
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
                    {formatTimestamp(estimate.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Send className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Sent</p>
                  <p className="text-sm font-medium">
                    {formatTimestamp(estimate.sent_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Accepted</p>
                  <p className="text-sm font-medium">
                    {formatTimestamp(estimate.accepted_at)}
                  </p>
                </div>
              </div>
              {estimate.declined_at && (
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Declined</p>
                    <p className="text-sm font-medium">
                      {formatTimestamp(estimate.declined_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[var(--border-light)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Client Details
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-[var(--text-muted)]">Name:</span>{" "}
                <span className="font-medium">{estimate.client.name}</span>
              </p>
              <p>
                <span className="text-[var(--text-muted)]">Email:</span>{" "}
                <span className="font-medium">{estimate.client.email}</span>
              </p>
              {estimate.client.phone && (
                <p>
                  <span className="text-[var(--text-muted)]">Phone:</span>{" "}
                  <span className="font-medium">{estimate.client.phone}</span>
                </p>
              )}
              {estimate.client.address && (
                <p>
                  <span className="text-[var(--text-muted)]">Address:</span>{" "}
                  <span className="font-medium">{estimate.client.address}</span>
                </p>
              )}
            </div>
          </div>

          {estimate.valid_until && (
            <div className="bg-white rounded-lg border border-[var(--border-light)] p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Validity
              </h3>
              <p className="text-sm">
                <span className="text-[var(--text-muted)]">Valid Until:</span>{" "}
                <span className="font-medium">
                  {new Date(estimate.valid_until + "T00:00:00").toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
