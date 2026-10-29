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
  Download,
  Link2,
  Check,
} from "lucide-react";
import { EstimateStatusBadge } from "@/components/admin/estimates";
import {
  sendDocument,
  downloadDocumentPdf,
  toEstimateDocument,
  DocumentPdfViewer,
} from "@/lib/pdf";
import {
  deleteEstimate,
  getClient,
  getEstimate,
  nowIso,
  setEstimateStatus,
  type Client,
  type Estimate,
} from "@/lib/db";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchEstimate = useCallback(async () => {
    if (!id) {
      router.push("/admin/estimates");
      return;
    }
    try {
      const est = await getEstimate(id);
      const cli = est ? await getClient(est.client_id) : null;
      if (!est || !cli) {
        router.push("/admin/estimates");
        return;
      }
      setEstimate({
        ...est,
        items: [...est.items].sort((a, b) => a.sort_order - b.sort_order),
      });
      setClient(cli);
      setLoading(false);
    } catch {
      router.push("/admin/estimates");
    }
  }, [id, router]);

  useEffect(() => {
    fetchEstimate();
  }, [fetchEstimate]);

  async function handleSend() {
    if (!estimate || !client) return;
    const action = estimate.status === "draft" ? "send" : "resend";
    setActionLoading(action);
    try {
      if (estimate.status === "draft") {
        try {
          await setEstimateStatus(estimate.id, "sent", { sent_at: nowIso() });
        } catch {
          throw new Error("Failed to update estimate status");
        }
      }

      // Render the PDF in the browser, then hand it to n8n to email
      await sendDocument(toEstimateDocument(estimate, client, estimate.items));

      await fetchEstimate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send estimate");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCopyShareLink() {
    if (!estimate) return;
    const url = `${window.location.origin}/share/?token=${estimate.public_token}`;
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
    if (!estimate || !client) return;
    setActionLoading("download");
    try {
      // Render the PDF in the browser and save it locally
      await downloadDocumentPdf(
        toEstimateDocument(estimate, client, estimate.items)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to download estimate");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkAccepted() {
    if (!estimate) return;
    setActionLoading("accepted");
    try {
      await setEstimateStatus(estimate.id, "accepted", {
        accepted_at: nowIso(),
      });
      await fetchEstimate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update estimate");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkDeclined() {
    if (!estimate) return;
    setActionLoading("declined");
    try {
      await setEstimateStatus(estimate.id, "declined", {
        declined_at: nowIso(),
      });
      await fetchEstimate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update estimate");
    } finally {
      setActionLoading(null);
    }
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
    try {
      await deleteEstimate(estimate.id);
      router.push("/admin/estimates");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete estimate");
      setActionLoading(null);
    }
  }

  if (loading || !estimate || !client) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
      </div>
    );
  }


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
              {client.name} &middot; {client.email}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {/* Available for every status — an accepted or declined estimate may
              still need a correction. */}
          <button
            onClick={() => router.push(`/admin/estimates/edit?id=${estimate.id}`)}
            className="btn btn-sm bg-white text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)] border border-[var(--border-light)]"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>

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
        {/* Estimate Preview — the actual PDF the client receives */}
        <div className="lg:col-span-2">
          <DocumentPdfViewer
            data={toEstimateDocument(estimate, client, estimate.items)}
          />
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
                <span className="font-medium">{client.name}</span>
              </p>
              <p>
                <span className="text-[var(--text-muted)]">Email:</span>{" "}
                <span className="font-medium">{client.email}</span>
              </p>
              {client.phone && (
                <p>
                  <span className="text-[var(--text-muted)]">Phone:</span>{" "}
                  <span className="font-medium">{client.phone}</span>
                </p>
              )}
              {client.address && (
                <p>
                  <span className="text-[var(--text-muted)]">Address:</span>{" "}
                  <span className="font-medium">{client.address}</span>
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
