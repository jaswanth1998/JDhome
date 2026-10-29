"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { EstimateForm } from "@/components/admin/estimates";
import type { EstimateFormData } from "@/components/admin/estimates/EstimateForm";
import type { EstimatePreviewData } from "@/components/admin/estimates/EstimatePreview";
import { sendDocument, toEstimateDocument } from "@/lib/pdf";
import {
  createClient,
  findEstimateByNumber,
  getClient,
  getEstimate,
  nowIso,
  setEstimateNumber,
  updateClient,
  updateEstimate,
  type Client,
  type Estimate,
  type EstimateInput,
} from "@/lib/db";

//TODO: Move this to env vars and backend config

/** Client details as entered in the form — what the PDF/email is addressed to. */
type SavedClient = {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  client_signature: string | null;
};

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

export default function EditEstimateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // The live preview panel is currently commented out below; the form still
  // reports its data so the panel can be switched back on without changes.
  const [, setPreviewData] = useState<EstimatePreviewData>({
    estimateNumber: "",
    clientName: "",
    clientAddress: "",
    estimateDate: new Date().toISOString().split("T")[0],
    validUntil: "",
    paymentMethod: "E-Transfer",
    items: [],
    notes: "",
    subtotal: 0,
    hstAmount: 0,
    total: 0,
    signatureDataUrl: "",
  });

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

  async function saveEstimate(
    formData: EstimateFormData,
    status: "draft" | "sent"
  ): Promise<{ estimate: Estimate; client: SavedClient }> {
    if (!estimate) throw new Error("Estimate not loaded");

    // 1. Upsert client
    const clientFields = {
      name: formData.clientName,
      email: formData.clientEmail,
      phone: formData.clientPhone || null,
      address: formData.clientAddress || null,
    };
    let clientId = formData.clientId;
    try {
      if (!clientId) {
        clientId = (await createClient(clientFields)).id;
      } else {
        await updateClient(clientId, clientFields);
      }
    } catch (err) {
      throw new Error("Failed to save client: " + errorMessage(err));
    }

    // 2. Compute totals
    const computedItems = formData.items.map((item, i) => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      return {
        description: item.description,
        quantity: qty,
        rate,
        amount: qty * rate,
        sort_order: i,
      };
    });
    const subtotal = computedItems.reduce((sum, i) => sum + i.amount, 0);
    const hstAmount = Math.round(subtotal * 0.13 * 100) / 100;
    const total = subtotal + hstAmount;

    // 3. Determine estimate number (editing never generates a new one)
    const finalEstimateNumber = formData.autoGenerate
      ? estimate.estimate_number
      : formData.estimateNumber.trim() || estimate.estimate_number;

    if (finalEstimateNumber !== estimate.estimate_number) {
      if (await findEstimateByNumber(finalEstimateNumber))
        throw new Error(`Estimate number ${finalEstimateNumber} already exists`);
      try {
        await setEstimateNumber(estimate.id, finalEstimateNumber);
      } catch (err) {
        throw new Error("Failed to update estimate: " + errorMessage(err));
      }
    }

    // 4. Update estimate record — `items` replaces the whole list, and the
    //    public share copy is refreshed in the same write.
    const patch: Partial<EstimateInput> = {
      client_id: clientId,
      estimate_date: formData.estimateDate,
      valid_until: formData.validUntil || null,
      payment_method: formData.paymentMethod,
      notes: formData.notes || null,
      client_signature: formData.signatureDataUrl || null,
      subtotal,
      hst_rate: 0.13,
      hst_amount: hstAmount,
      total,
      status,
      items: computedItems,
    };

    if (status === "sent" && estimate.status === "draft") {
      patch.sent_at = nowIso();
    }

    let saved: Estimate;
    try {
      saved = await updateEstimate(estimate.id, patch);
    } catch (err) {
      throw new Error("Failed to update estimate: " + errorMessage(err));
    }

    return {
      estimate: saved,
      client: {
        ...clientFields,
        client_signature: formData.signatureDataUrl || null,
      },
    };
  }

  async function handleSaveDraft(formData: EstimateFormData) {
    setIsSaving(true);
    try {
      const result = await saveEstimate(formData, "draft");
      router.push(`/admin/estimates/view?id=${result.estimate.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save estimate");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveAndSend(formData: EstimateFormData) {
    setIsSaving(true);
    try {
      const result = await saveEstimate(formData, "sent");

      await sendDocument(
        toEstimateDocument(
          result.estimate,
          result.client,
          result.estimate.items
        )
      );

      router.push(`/admin/estimates/view?id=${result.estimate.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save estimate");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading || !estimate || !client) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
      </div>
    );
  }

  const initialData: EstimateFormData = {
    estimateNumber: estimate.estimate_number,
    autoGenerate: false,
    clientName: client.name,
    clientEmail: client.email,
    clientPhone: client.phone ?? "",
    clientAddress: client.address ?? "",
    clientId: estimate.client_id,
    estimateDate: estimate.estimate_date,
    validUntil: estimate.valid_until ?? "",
    paymentMethod: estimate.payment_method,
    notes: estimate.notes ?? "",
    signatureDataUrl: estimate.client_signature ?? "",
    items: estimate.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
    })),
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(`/admin/estimates/view?id=${estimate.id}`)}
          className="p-2 rounded-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Edit Estimate
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {estimate.estimate_number}
          </p>
        </div>
      </div>

      {/* Form + Preview layout */}
      <div>
        {/* Form */}
        <div className="bg-white rounded-lg border border-[var(--border-light)] p-4 sm:p-6">
          <EstimateForm
            initialData={initialData}
            onPreviewChange={setPreviewData}
            onSaveDraft={handleSaveDraft}
            onSaveAndSend={handleSaveAndSend}
            isSaving={isSaving}
            saveLabels={{ draft: "Update Draft", send: "Update & Send" }}
          />
        </div>

        {/* Preview */}
        {/* <div className="hidden lg:block">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Preview
            </p>
            <EstimatePreview data={previewData} />
          </div>
        </div> */}
      </div>
    </div>
  );
}
