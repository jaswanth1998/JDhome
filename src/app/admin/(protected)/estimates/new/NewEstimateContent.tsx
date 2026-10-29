"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EstimateForm } from "@/components/admin/estimates";
import type { EstimateFormData } from "@/components/admin/estimates/EstimateForm";
import type { EstimatePreviewData } from "@/components/admin/estimates/EstimatePreview";
import { sendDocument, toEstimateDocument } from "@/lib/pdf";
import {
  createClient,
  createEstimate,
  findEstimateByNumber,
  nowIso,
  updateClient,
  type Estimate,
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

export default function NewEstimateContent() {
  const router = useRouter();
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

  async function saveEstimate(
    formData: EstimateFormData,
    status: "draft" | "sent"
  ): Promise<{ estimate: Estimate; client: SavedClient }> {
    // 1. Determine estimate number. Auto numbers (EST-YYYYMM-NNN) are reserved
    //    by createEstimate inside its transaction; custom ones must be unique.
    let customNumber: string | undefined;
    if (!formData.autoGenerate) {
      customNumber = formData.estimateNumber.trim();
      if (!customNumber) throw new Error("Estimate number is required");
      if (await findEstimateByNumber(customNumber))
        throw new Error(`Estimate number ${customNumber} already exists`);
    }

    // 2. Upsert client
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

    // 3. Compute totals
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

    // 4. Save the estimate with its line items embedded (and its share copy)
    let estimate: Estimate;
    try {
      estimate = await createEstimate(
        {
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
          sent_at: status === "sent" ? nowIso() : null,
          items: computedItems,
        },
        customNumber ? { estimate_number: customNumber } : {}
      );
    } catch (err) {
      throw new Error("Failed to save estimate: " + errorMessage(err));
    }

    return {
      estimate,
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

      // Call webhook to send estimate email
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/admin/estimates")}
          className="p-2 rounded-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            New Estimate
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Fill in the details below
          </p>
        </div>
      </div>

      {/* Form + Preview layout */}
      <div >
        {/* Form */}
        <div className="bg-white rounded-lg border border-[var(--border-light)] p-4 sm:p-6">
          <EstimateForm
            onPreviewChange={setPreviewData}
            onSaveDraft={handleSaveDraft}
            onSaveAndSend={handleSaveAndSend}
            isSaving={isSaving}
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
