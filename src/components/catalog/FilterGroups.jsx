import { CATEGORIES } from "@shared/enums.js";
import { Accordion, AccordionItem } from "@/components/ui/Accordion.jsx";
import { Checkbox } from "@/components/ui/Choice.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Chip } from "@/components/ui/Chip.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { cn } from "@/lib/cn.js";
import {
  PRICE_PRESETS,
  activePricePreset,
  toggleValue,
  visibleGroups,
  withCategory,
  withPriceRange,
} from "@/lib/filters.js";
import { ShapeIcon } from "./ShapeIcon.jsx";
import { swatchStyle } from "./ColorSwatches.jsx";

const OPEN_BY_DEFAULT = 4;

function OptionLabel({ group, option, count }) {
  return (
    <span className="flex items-center gap-2">
      {group.swatch ? (
        <span className="block h-4 w-4 shrink-0 rounded-full border border-ink-300" style={swatchStyle(option.value)} aria-hidden="true" />
      ) : null}
      {group.key === "shape" ? <ShapeIcon shape={option.value} className="h-4 w-8 shrink-0 text-ink-800" /> : null}
      <span>{option.label}</span>
      <span className="text-sm text-ink-600">({count})</span>
    </span>
  );
}

function CheckboxGroup({ group, filters, counts, onChange }) {
  const selected = filters[group.key];
  return (
    <ul className="grid">
      {group.options.map((option) => {
        const count = counts[group.key]?.[option.value] ?? 0;
        const isSelected = selected.includes(option.value);
        const isDisabled = count === 0 && !isSelected;
        return (
          <li key={option.value}>
            <Checkbox
              checked={isSelected}
              aria-disabled={isDisabled || undefined}
              onChange={() => !isDisabled && onChange(toggleValue(filters, group.key, option.value))}
              className={cn("py-1", isDisabled && "cursor-not-allowed opacity-50")}
              label={<OptionLabel group={group} option={option} count={count} />}
            />
          </li>
        );
      })}
    </ul>
  );
}

function CategoryPills({ filters, counts, onChange }) {
  const pills = [{ value: null, label: "All" }, ...CATEGORIES];
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
      {pills.map(({ value, label }) => {
        const count = counts[value ?? "all"];
        return (
          <Chip key={label} selected={filters.category === value} onClick={() => onChange(withCategory(filters, value))}>
            {label}
            <span className="text-xs opacity-80">({count})</span>
          </Chip>
        );
      })}
    </div>
  );
}

function PriceFilter({ filters, presetCounts, onChange }) {
  const activePreset = activePricePreset(filters);
  const commitRange = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parse = (name) => {
      const value = Number.parseInt(form.get(name), 10);
      return Number.isFinite(value) && value >= 0 ? value : null;
    };
    onChange(withPriceRange(filters, parse("min"), parse("max")));
  };
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Price ranges">
        {PRICE_PRESETS.map((preset) => {
          const isActive = activePreset?.id === preset.id;
          const isEmpty = presetCounts[preset.id] === 0 && !isActive;
          return (
            <Chip
              key={preset.id}
              selected={isActive}
              aria-disabled={isEmpty || undefined}
              className={isEmpty ? "cursor-not-allowed opacity-50" : undefined}
              onClick={() => !isEmpty && onChange(isActive ? withPriceRange(filters, null, null) : withPriceRange(filters, preset.min, preset.max))}
            >
              {preset.label}
            </Chip>
          );
        })}
      </div>
      <form key={`${filters.priceMin}-${filters.priceMax}`} onSubmit={commitRange} className="flex items-end gap-2">
        <label className="grid flex-1 gap-1 text-sm font-medium text-ink-800">
          Min (Rs)
          <Input name="min" type="number" inputMode="numeric" min="0" step="100" defaultValue={filters.priceMin ?? ""} />
        </label>
        <label className="grid flex-1 gap-1 text-sm font-medium text-ink-800">
          Max (Rs)
          <Input name="max" type="number" inputMode="numeric" min="0" step="100" defaultValue={filters.priceMax ?? ""} />
        </label>
        <Button type="submit" variant="secondary" size="sm">Apply</Button>
      </form>
    </div>
  );
}

function AvailabilityFilter({ filters, onChange }) {
  return (
    <Checkbox
      checked={filters.inStock}
      onChange={(event) => onChange({ ...filters, inStock: event.target.checked })}
      label="In stock only"
      className="py-1"
    />
  );
}

const sectionsFor = (filters) => {
  const groups = visibleGroups(filters.category).filter((group) => group.key !== "badge");
  const badge = visibleGroups(filters.category).filter((group) => group.key === "badge");
  const priceAnchor = filters.category === "lenses" ? -1 : groups.findIndex((group) => group.key === "color");
  const before = groups.slice(0, priceAnchor + 1).map((group) => ({ id: group.key, title: group.title, group }));
  const after = groups.slice(priceAnchor + 1).map((group) => ({ id: group.key, title: group.title, group }));
  return [
    { id: "category", title: "Category" },
    ...before,
    { id: "price", title: "Price" },
    ...after,
    { id: "availability", title: "Availability" },
    ...badge.map((group) => ({ id: group.key, title: group.title, group })),
  ];
};

const selectedCountFor = (section, filters) => {
  if (section.group) return filters[section.group.key].length;
  if (section.id === "price") return Number(filters.priceMin !== null || filters.priceMax !== null);
  if (section.id === "availability") return Number(filters.inStock);
  return 0;
};

function SectionBody({ section, ...props }) {
  if (section.id === "category") return <CategoryPills {...props} counts={props.categoryCounts} />;
  if (section.id === "price") return <PriceFilter {...props} />;
  if (section.id === "availability") return <AvailabilityFilter {...props} />;
  return <CheckboxGroup group={section.group} {...props} />;
}

export function FilterGroups({ filters, counts, presetCounts, categoryCounts, onChange }) {
  const sections = sectionsFor(filters);
  return (
    <Accordion>
      {sections.map((section, index) => (
        <AccordionItem
          key={`${filters.category ?? "all"}-${section.id}`}
          title={section.title}
          count={selectedCountFor(section, filters) || undefined}
          defaultOpen={index < OPEN_BY_DEFAULT || selectedCountFor(section, filters) > 0}
        >
          <SectionBody
            section={section}
            filters={filters}
            counts={counts}
            presetCounts={presetCounts}
            categoryCounts={categoryCounts}
            onChange={onChange}
          />
        </AccordionItem>
      ))}
    </Accordion>
  );
}
