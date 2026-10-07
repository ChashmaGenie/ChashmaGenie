import { BottomSheet } from "@/components/ui/Modal.jsx";
import { Radio } from "@/components/ui/Choice.jsx";
import { SORTS } from "@/lib/filters.js";

export function SortSheet({ open, sort, onSelect, onClose }) {
  const choose = (value) => {
    onSelect(value);
    onClose();
  };
  return (
    <BottomSheet open={open} onClose={onClose} title="Sort by">
      <div role="radiogroup" aria-label="Sort by">
        {SORTS.map((option) => (
          <Radio key={option.value} name="shop-sort" label={option.label} checked={sort === option.value} onChange={() => choose(option.value)} />
        ))}
      </div>
    </BottomSheet>
  );
}
