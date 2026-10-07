import { X } from "lucide-react";
import { activeChips, clearFilters, removeChip } from "@/lib/filters.js";

export function ActiveChips({ filters, onChange }) {
  const chips = activeChips(filters);
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters" role="group">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onChange(removeChip(filters, chip))}
          aria-label={`Remove filter ${chip.label}`}
          className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border border-ink-300 bg-cream-50 ps-4 pe-3 text-sm font-medium text-ink-800 hover:bg-ink-100"
        >
          {chip.label}
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(clearFilters(filters))}
        className="focus-ring min-h-[44px] rounded-[10px] px-3 text-sm font-semibold text-teal-600 underline-offset-2 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
