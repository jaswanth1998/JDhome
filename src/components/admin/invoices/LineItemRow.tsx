"use client";

import { Trash2 } from "lucide-react";

type LineItemRowProps = {
  index: number;
  description: string;
  quantity: number | string;
  rate: number | string;
  amount: number;
  onChange: (
    index: number,
    field: "description" | "quantity" | "rate",
    value: string
  ) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
};

export function LineItemRow({
  index,
  description,
  quantity,
  rate,
  amount,
  onChange,
  onRemove,
  canRemove,
}: LineItemRowProps) {
  return (
    <>
      {/* Desktop layout */}
      <div className="hidden sm:grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 items-center">
        <input
          type="text"
          className="input !h-10 text-sm"
          placeholder="Description"
          value={description}
          onChange={(e) => onChange(index, "description", e.target.value)}
        />
        <input
          type="number"
          className="input !h-10 text-sm text-center"
          placeholder="Qty"
          min="0"
          step="1"
          value={quantity}
          onChange={(e) => onChange(index, "quantity", e.target.value)}
        />
        <input
          type="number"
          className="input !h-10 text-sm text-right"
          placeholder="Rate"
          min="0"
          step="0.01"
          value={rate}
          onChange={(e) => onChange(index, "rate", e.target.value)}
        />
        <div className="text-sm font-medium text-right text-[var(--text-primary)] pr-1">
          $
          {amount.toLocaleString("en-CA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="p-1.5 rounded hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile stacked layout */}
      <div className="sm:hidden bg-[var(--neutral-lightest-gray)] rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-muted)]">Item {index + 1}</span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            className="p-1 rounded hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <input
          type="text"
          className="input !h-9 text-sm w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => onChange(index, "description", e.target.value)}
        />
        <div className="grid grid-cols-3 gap-2 items-center">
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">Qty</label>
            <input
              type="number"
              className="input !h-9 text-sm text-center w-full"
              placeholder="0"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => onChange(index, "quantity", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">Rate</label>
            <input
              type="number"
              className="input !h-9 text-sm text-right w-full"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={rate}
              onChange={(e) => onChange(index, "rate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">Amount</label>
            <div className="text-sm font-medium text-right text-[var(--text-primary)] h-9 flex items-center justify-end">
              ${amount.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
