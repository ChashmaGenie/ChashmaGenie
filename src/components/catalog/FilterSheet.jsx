import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { applyFilters, categoryCounts, clearFilters, facetCounts, pricePresetCounts } from "@/lib/filters.js";
import { FilterGroups } from "./FilterGroups.jsx";

const resultsLabel = (count) => `Apply (${count} ${count === 1 ? "result" : "results"})`;

function FilterSheetBody({ products, initialFilters, onApply, onClose }) {
  const [draft, setDraft] = useState(initialFilters);
  const counts = useMemo(() => facetCounts(products, draft), [products, draft]);
  const presetCounts = useMemo(() => pricePresetCounts(products, draft), [products, draft]);
  const categories = useMemo(() => categoryCounts(products, draft), [products, draft]);
  const resultCount = useMemo(() => applyFilters(products, draft).length, [products, draft]);

  const apply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <BottomSheet
      open
      onClose={onClose}
      title="Filters"
      className="h-[92vh]"
      footer={
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setDraft(clearFilters(draft))}>Clear all</Button>
          <Button fullWidth onClick={apply}>{resultsLabel(resultCount)}</Button>
        </div>
      }
    >
      <FilterGroups filters={draft} counts={counts} presetCounts={presetCounts} categoryCounts={categories} onChange={setDraft} />
    </BottomSheet>
  );
}

export function FilterSheet({ open, ...props }) {
  return open ? <FilterSheetBody {...props} /> : null;
}
