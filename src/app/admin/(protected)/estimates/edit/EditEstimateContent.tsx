"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  EstimateForm,
  EstimatePreview,
} from "@/components/admin/estimates";
import type { EstimateFormData } from "@/components/admin/estimates/EstimateForm";
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
  client_id: string;
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

export default function EditEstimateContent() {
  const { supabase, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [estimate, setEstimate] = useState<EstimateDetail | null>(null);
  const [loading, setLoading] = useState(true);
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
        subtotal, hst_rate, hst_amount, total, status, client_id,
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

  async function updateEstimate(
    formData: EstimateFormData,
    status: "draft" | "sent"
  ) {
    if (!estimate) throw new Error("Estimate not loaded");

    // 1. Upsert client
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

      if (clientError)
        throw new Error("Failed to save client: " + clientError.message);
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

    // 3. Determine estimate number
    const finalEstimateNumber = formData.autoGenerate
      ? estimate.estimate_number
      : formData.estimateNumber.trim() || estimate.estimate_number;

    // 4. Update estimate record
    const updatePayload: Record<string, unknown> = {
      estimate_number: finalEstimateNumber,
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
    };

    if (status === "sent" && estimate.status === "draft") {
      updatePayload.sent_at = new Date().toISOString();
    }

    const { error: estimateError } = await supabase
      .schema("jdhome")
      .from("estimates")
      .update(updatePayload)
      .eq("id", estimate.id);

    if (estimateError)
      throw new Error("Failed to update estimate: " + estimateError.message);

    // 5. Replace line items: delete old, insert new
    const { error: deleteError } = await supabase
      .schema("jdhome")
      .from("estimate_items")
      .delete()
      .eq("estimate_id", estimate.id);

    if (deleteError)
      throw new Error("Failed to update line items: " + deleteError.message);

    const itemsToInsert = computedItems.map((item) => ({
      estimate_id: estimate.id,
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

    if (itemsError)
      throw new Error("Failed to save line items: " + itemsError.message);

    return {
      id: estimate.id,
      client: {
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone || null,
        address: formData.clientAddress || null,
        client_signature: formData.signatureDataUrl || null,
      },
      estimate: {
        estimate_number: finalEstimateNumber,
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
      },
      estimate_items: itemsToInsert,
    };
  }

  async function handleSaveDraft(formData: EstimateFormData) {
    setIsSaving(true);
    try {
      const result = await updateEstimate(formData, "draft");
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
      const result = await updateEstimate(formData, "sent");

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

  if (loading || !estimate) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
      </div>
    );
  }

  const initialData: EstimateFormData = {
    estimateNumber: estimate.estimate_number,
    autoGenerate: false,
    clientName: estimate.client.name,
    clientEmail: estimate.client.email,
    clientPhone: estimate.client.phone ?? "",
    clientAddress: estimate.client.address ?? "",
    clientId: estimate.client_id,
    estimateDate: estimate.estimate_date,
    validUntil: estimate.valid_until ?? "",
    paymentMethod: estimate.payment_method,
    notes: estimate.notes ?? "",
    signatureDataUrl: estimate.client_signature ?? "",
    items: estimate.estimate_items.map((item) => ({
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
