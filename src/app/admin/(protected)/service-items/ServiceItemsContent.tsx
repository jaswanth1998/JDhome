"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  Package,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

type ServiceItem = {
  id: string;
  name: string;
  description: string;
  default_rate: number;
  category: string;
  is_active: boolean;
  created_at: string;
};

type FormState = {
  name: string;
  description: string;
  default_rate: string;
  category: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  default_rate: "",
  category: "General",
  is_active: true,
};

const CATEGORIES = [
  "General",
  "Locksmith",
  "Smart Home",
  "Security",
  "Installation",
  "Repair",
  "Consultation",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

export default function ServiceItemsContent() {
  const { supabase } = useAuth();
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .schema("jdhome")
      .from("service_items")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });
    setItems((data as ServiceItem[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Filtering
  const categories = [
    "all",
    ...Array.from(new Set(items.map((i) => i.category))).sort(),
  ];

  const filtered = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Open modal for create or edit
  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  }

  function openEdit(item: ServiceItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      default_rate: String(item.default_rate),
      category: item.category,
      is_active: item.is_active,
    });
    setError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  // Validate
  function validate(): string | null {
    if (!form.name.trim()) return "Name is required";
    if (!form.description.trim()) return "Description is required";
    const rate = Number(form.default_rate);
    if (isNaN(rate) || rate < 0) return "Rate must be a valid positive number";
    return null;
  }

  // Save
  async function handleSave() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      default_rate: Number(form.default_rate) || 0,
      category: form.category,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error: updateError } = await supabase
        .schema("jdhome")
        .from("service_items")
        .update(payload)
        .eq("id", editingId);
      if (updateError) {
        setError("Failed to update: " + updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .schema("jdhome")
        .from("service_items")
        .insert(payload);
      if (insertError) {
        setError("Failed to create: " + insertError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    closeModal();
    fetchItems();
  }

  // Delete
  async function handleDelete(item: ServiceItem) {
    if (
      !confirm(`Delete "${item.name}"? This cannot be undone.`)
    )
      return;
    await supabase
      .schema("jdhome")
      .from("service_items")
      .delete()
      .eq("id", item.id);
    fetchItems();
  }

  // Toggle active
  async function handleToggleActive(item: ServiceItem) {
    await supabase
      .schema("jdhome")
      .from("service_items")
      .update({ is_active: !item.is_active, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    fetchItems();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Service Items
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Manage predefined items for invoices
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex gap-1 bg-[var(--neutral-light-gray)] rounded-lg p-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? "bg-white text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            className="input !h-9 text-sm !pl-9"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-[var(--border-light)]">
          <Package className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
          <p className="text-[var(--text-muted)] mb-4">
            {items.length === 0
              ? "No service items yet"
              : "No items match your search"}
          </p>
          {items.length === 0 && (
            <button onClick={openCreate} className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              Add your first item
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
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--border-light)] last:border-b-0 hover:bg-[var(--neutral-lightest-gray)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[250px] truncate">
                      {item.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--neutral-light-gray)] text-[var(--text-secondary)]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">
                      {formatCurrency(item.default_rate)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          item.is_active
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded hover:bg-[var(--neutral-light-gray)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-[var(--border-light)] p-3"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {item.name}
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          item.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded hover:bg-[var(--neutral-light-gray)] text-[var(--text-muted)]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--neutral-light-gray)] text-[var(--text-secondary)]">
                    {item.category}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {formatCurrency(item.default_rate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md border border-[var(--border-light)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {editingId ? "Edit Item" : "New Item"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-[var(--neutral-light-gray)] text-[var(--text-muted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-5 py-4 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  className="input !h-10 text-sm"
                  placeholder="e.g. Lock Rekey"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Description *
                </label>
                <textarea
                  className="input textarea text-sm !h-auto"
                  placeholder="Description that appears on the invoice line item"
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Default Rate ($) *
                  </label>
                  <input
                    type="number"
                    className="input !h-10 text-sm"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={form.default_rate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, default_rate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Category
                  </label>
                  <select
                    className="input !h-10 text-sm"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editingId && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_active: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-[var(--border-light)] text-[var(--accent-teal)] focus:ring-[var(--accent-teal)]"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    Active
                  </span>
                </label>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-[var(--border-light)]">
              <button
                type="button"
                onClick={closeModal}
                className="btn btn-outline btn-sm flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary btn-sm flex-1"
              >
                <Check className="w-4 h-4" />
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
