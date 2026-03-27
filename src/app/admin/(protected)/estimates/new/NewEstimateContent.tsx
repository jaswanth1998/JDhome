"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  EstimateForm,
  EstimatePreview,
} from "@/components/admin/estimates";
import type { EstimateFormData } from "@/components/admin/estimates/EstimateForm";
import type { EstimatePreviewData } from "@/components/admin/estimates/EstimatePreview";
//TODO: Move this to env vars and backend config
const ESTIMATE_WEBHOOK_URL = "ESTIMATE_WEBHOOK_PLACEHOLDER";

export default function NewEstimateContent() {
  const { supabase, user } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [previewData, setPreviewData] = useState<EstimatePreviewData>({
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
  ) {
    // 1. Determine estimate number
    let estimateNumber: string;
    if (formData.autoGenerate) {
      const { data: numData, error: numError } = await supabase
        .schema("jdhome")
        .rpc("generate_estimate_number");
      if (numError) throw new Error("Failed to generate estimate number: " + numError.message);
      estimateNumber = numData as string;
    } else {
      estimateNumber = formData.estimateNumber.trim();
      if (!estimateNumber) throw new Error("Estimate number is required");
    }

    // 2. Upsert client
    let clientId = formData.clientId;
    if (!clientId) {
      const { data: clientData, error: clientError } = await supabase
        .schema("jdhome")
        .from("clients")
        .insert({
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone || null,
          address: formData.clientAddress || null,
          created_by: user?.id,
        })
        .select("id")
        .single();

      if (clientError) throw new Error("Failed to save client: " + clientError.message);
      clientId = clientData.id;
    } else {
      await supabase
        .schema("jdhome")
        .from("clients")
        .update({
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone || null,
          address: formData.clientAddress || null,
        })
        .eq("id", clientId);
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

    // 4. Insert estimate
    const { data: estimateData, error: estimateError } = await supabase
      .schema("jdhome")
      .from("estimates")
      .insert({
        estimate_number: estimateNumber,
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
        sent_at: status === "sent" ? new Date().toISOString() : null,
        created_by: user?.id,
      })
      .select("id")
      .single();

    if (estimateError) throw new Error("Failed to save estimate: " + estimateError.message);

    // 5. Insert line items
    const itemsToInsert = computedItems.map((item) => ({
      estimate_id: estimateData.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      sort_order: item.sort_order,
    }));

    const { error: itemsError } = await supabase
      .schema("jdhome")
      .from("estimate_items")
      .insert(itemsToInsert);

    if (itemsError) throw new Error("Failed to save line items: " + itemsError.message);

    return {
      id: estimateData.id,
      client: {
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone || null,
        address: formData.clientAddress || null,
        client_signature: formData.signatureDataUrl || null,
        created_by: user?.id,
      },
      estimate: {
        estimate_number: estimateNumber,
        client_id: clientId,
        estimate_date: formData.estimateDate,
        valid_until: formData.validUntil || null,
        payment_method: formData.paymentMethod,
        notes: formData.notes || null,
        subtotal,
        hst_rate: 0.13,
        hst_amount: hstAmount,
        total,
        status,
        created_by: user?.id,
      },
      estimate_items: itemsToInsert,
    };
  }

  async function handleSaveDraft(formData: EstimateFormData) {
    setIsSaving(true);
    try {
      const result = await saveEstimate(formData, "draft");
      router.push(`/admin/estimates/view?id=${result.id}`);
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
      const webhookRes = await fetch(ESTIMATE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: result.client,
          estimate: result.estimate,
          estimate_items: result.estimate_items,
        }),
      });

      if (!webhookRes.ok) {
        throw new Error("Failed to send estimate via webhook");
      }

      router.push(`/admin/estimates/view?id=${result.id}`);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Preview
            </p>
            <EstimatePreview data={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
