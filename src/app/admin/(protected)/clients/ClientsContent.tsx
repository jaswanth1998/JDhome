"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Users,
  Pencil,
  Trash2,
  Loader2,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { InvoiceStatusBadge } from "@/components/admin/invoices";

type ClientDoc = {
  id: string;
  number: string;
  date: string;
  total: number;
  status: string;
  kind: "invoice" | "estimate";
};

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  docs: ClientDoc[];
  /** Non-draft invoices */
  invoiced: number;
  outstanding: number;
};

type ClientRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  invoices: {
    id: string;
    invoice_number: string;
    invoice_date: string;
    total: number;
    status: string;
  }[];
  estimates: {
    id: string;
    estimate_number: string;
    estimate_date: string;
    total: number;
    status: string;
  }[];
};

const EMPTY_FORM = { name: "", email: "", phone: "", address: "" };
const labelClass = "block text-xs font-medium text-[var(--text-muted)] mb-1";

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

function toClient(row: ClientRow): Client {
  const docs: ClientDoc[] = [
    ...row.invoices.map((i) => ({
      id: i.id,
      number: i.invoice_number,
      date: i.invoice_date,
      total: Number(i.total),
      status: i.status,
      kind: "invoice" as const,
    })),
    ...row.estimates.map((e) => ({
      id: e.id,
      number: e.estimate_number,
      date: e.estimate_date,
      total: Number(e.total),
      status: e.status,
      kind: "estimate" as const,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const billed = row.invoices.filter((i) => i.status !== "draft");
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    docs,
    invoiced: billed.reduce((sum, i) => sum + Number(i.total), 0),
    outstanding: billed
      .filter((i) => i.status !== "paid" && i.status !== "cancelled")
      .reduce((sum, i) => sum + Number(i.total), 0),
  };
}

export default function ClientsContent() {
  const { supabase, user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const fetchClients = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .schema("jdhome")
        .from("clients")
        .select(
          `
          id, name, email, phone, address,
          invoices(id, invoice_number, invoice_date, total, status),
          estimates(id, estimate_number, estimate_date, total, status)
        `,
        )
        .order("name");
      if (cancelled) return;
      setClients(((data as unknown as ClientRow[]) ?? []).map(toClient));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, reloadKey]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowModal(true);
  }

  function openEdit(client: Client) {
    setEditingId(client.id);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone ?? "",
      address: client.address ?? "",
    });
    setError(null);
    setShowModal(true);
  }

  async function handleSave() {
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name) return setError("Name is required");
    if (!email) return setError("Email is required");

    setIsSaving(true);
    setError(null);
    const values = {
      name,
      email,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    };
    const clientsTable = supabase.schema("jdhome").from("clients");
    const { error: saveError } = editingId
      ? await clientsTable.update(values).eq("id", editingId)
      : await clientsTable.insert({ ...values, created_by: user?.id });
    setIsSaving(false);

    if (saveError)
      return setError("Failed to save client: " + saveError.message);
    setShowModal(false);
    fetchClients();
  }

  async function handleDelete(client: Client) {
    if (client.docs.length > 0) {
      alert(
        `${client.name} has ${client.docs.length} invoice(s)/estimate(s) on file and cannot be deleted.`,
      );
      return;
    }
    if (!confirm(`Delete client ${client.name}? This cannot be undone.`))
      return;
    setDeletingId(client.id);
    const { error: deleteError } = await supabase
      .schema("jdhome")
      .from("clients")
      .delete()
      .eq("id", client.id);
    setDeletingId(null);
    if (deleteError) return alert("Failed to delete client");
    fetchClients();
  }

  const q = searchQuery.toLowerCase();
  const filtered = q
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q),
      )
    : clients;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Clients
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Contact details and document history
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          New Client
        </button>
      </div>

      {/* Search */}
      <div className="relative sm:max-w-xs mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          className="input !h-9 text-sm !pl-9"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner text-[var(--accent-teal)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-[var(--border-light)]">
          <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
          <p className="text-[var(--text-muted)]">
            {clients.length === 0
              ? "No clients yet"
              : "No clients match your search"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => {
            const isOpen = openId === client.id;
            return (
              <div
                key={client.id}
                className="bg-white rounded-lg border border-[var(--border-light)]"
              >
                <div
                  onClick={() => setOpenId(isOpen ? null : client.id)}
                  className="flex items-center gap-3 p-3 sm:px-4 cursor-pointer hover:bg-[var(--neutral-lightest-gray)] rounded-lg transition-colors"
                >
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {client.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {client.email}
                      {client.phone && ` · ${client.phone}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {formatCurrency(client.invoiced)}
                    </p>
                    <p
                      className={`text-xs ${
                        client.outstanding > 0
                          ? "text-amber-700"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {client.outstanding > 0
                        ? `${formatCurrency(client.outstanding)} outstanding`
                        : `${client.docs.length} document${
                            client.docs.length === 1 ? "" : "s"
                          }`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(client);
                      }}
                      className="p-1.5 rounded hover:bg-[var(--neutral-light-gray)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      title={
                        client.docs.length > 0
                          ? "Clients with invoices or estimates cannot be deleted"
                          : "Delete"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(client);
                      }}
                      disabled={deletingId === client.id}
                      className={`p-1.5 rounded transition-colors disabled:opacity-40 ${
                        client.docs.length > 0
                          ? "text-[var(--text-muted)] opacity-40"
                          : "text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      {deletingId === client.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-[var(--border-light)] px-4 py-3 text-sm">
                    {client.address && (
                      <p className="text-xs text-[var(--text-secondary)] mb-3">
                        <span className="text-[var(--text-muted)]">
                          Address:
                        </span>{" "}
                        {client.address}
                      </p>
                    )}
                    {client.docs.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)]">
                        No invoices or estimates yet
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {client.docs.map((doc) => (
                          <div
                            key={doc.kind + doc.id}
                            onClick={() =>
                              router.push(
                                `/admin/${doc.kind}s/view?id=${doc.id}`,
                              )
                            }
                            className="flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-[var(--neutral-lightest-gray)] rounded px-1 py-1"
                          >
                            <span className="min-w-0 truncate text-[var(--text-secondary)]">
                              <span className="font-medium text-[var(--text-primary)]">
                                {doc.number}
                              </span>
                              {" · "}
                              {doc.kind === "estimate" ? "Estimate · " : ""}
                              {formatDate(doc.date)}
                            </span>
                            <span className="flex items-center gap-2 shrink-0">
                              {formatCurrency(doc.total)}
                              {doc.kind === "invoice" ? (
                                <InvoiceStatusBadge status={doc.status} />
                              ) : (
                                <span className="capitalize text-[var(--text-muted)]">
                                  {doc.status}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md border border-[var(--border-light)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {editingId ? "Edit Client" : "New Client"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--neutral-light-gray)] text-[var(--text-muted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  className="input !h-10 text-sm"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  autoFocus
                />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input
                  type="email"
                  className="input !h-10 text-sm"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  className="input !h-10 text-sm"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <textarea
                  className="input textarea text-sm !h-auto"
                  rows={2}
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--border-light)]">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary btn-sm"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
