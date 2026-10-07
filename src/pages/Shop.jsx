import { useMemo, useState } from "react";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { CATEGORIES, labelOf } from "@shared/enums.js";
import { Seo } from "@/components/layout/Seo.jsx";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Chip } from "@/components/ui/Chip.jsx";
import { EmptyState } from "@/components/ui/EmptyState.jsx";
import { Select } from "@/components/ui/Input.jsx";
import { ActiveChips } from "@/components/catalog/ActiveChips.jsx";
import { FilterGroups } from "@/components/catalog/FilterGroups.jsx";
import { FilterSheet } from "@/components/catalog/FilterSheet.jsx";
import { GridSkeleton, NoResults, ProductGrid } from "@/components/catalog/ProductGrid.jsx";
import { ShopSearch } from "@/components/catalog/ShopSearch.jsx";
import { SortSheet } from "@/components/catalog/SortSheet.jsx";
import { useShopFilters } from "@/components/catalog/useShopFilters.js";
import { useStickyOffset } from "@/components/catalog/useStickyOffset.js";
import { useCatalog } from "@/lib/catalog.jsx";
import {
  SORTS,
  applyFilters,
  categoryCounts,
  clearFilters,
  countActiveFilters,
  facetCounts,
  pricePresetCounts,
  withCategory,
} from "@/lib/filters.js";

const PAGE_SIZE = 24;

const CATEGORY_COPY = {
  eyeglasses: "Everyday frames for work, study and play. Pick a pair, add your prescription and we will quote the lenses.",
  sunglasses: "UV400 shades in classic and modern shapes. Add your power for prescription sunglasses.",
  computer: "Frames made for long screen hours, with blue-light lens options in plain or prescription.",
  kids: "Light, flexible frames sized for growing faces.",
  lenses: "Browse lens packages by type, thickness and coating. Choose one here and we pair it with your frame in your quote.",
};

const DEFAULT_COPY = "Eyeglasses, sunglasses and lenses. Filter by shape, size, colour and price, then ask for a quote.";

const pageTitle = (category) => (category ? labelOf(CATEGORIES, category) : "Shop glasses");

const shouldHideFromSearch = (filters) => countActiveFilters(filters) > 0 || filters.q.length > 0 || filters.sort !== "featured";

const resultsText = (count, isLoading) => {
  if (isLoading) return "Loading glasses";
  return `${count} ${count === 1 ? "result" : "results"}`;
};

function CategoryPills({ filters, onChange }) {
  const pills = [{ value: null, label: "All" }, ...CATEGORIES];
  return (
    <nav aria-label="Categories" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0 lg:hidden">
      {pills.map(({ value, label }) => (
        <Chip key={label} selected={filters.category === value} onClick={() => onChange(withCategory(filters, value))} className="shrink-0">
          {label}
        </Chip>
      ))}
    </nav>
  );
}

function SortSelect({ sort, onSelect }) {
  return (
    <label className="hidden items-center gap-2 whitespace-nowrap text-sm font-medium text-ink-800 lg:flex">
      Sort by
      <Select value={sort} onChange={(event) => onSelect(event.target.value)} className="min-h-[44px] w-auto">
        {SORTS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </Select>
    </label>
  );
}

function MobileBar({ offset, activeCount, onOpenFilters, onOpenSort }) {
  return (
    <div style={{ top: offset }} className="sticky z-30 -mx-4 flex gap-3 border-b border-ink-200 bg-cream-100 px-4 py-2 md:-mx-6 md:px-6 lg:hidden">
      <Button variant="secondary" size="sm" fullWidth onClick={onOpenFilters}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filters{activeCount > 0 ? ` (${activeCount})` : ""}
      </Button>
      <Button variant="secondary" size="sm" fullWidth onClick={onOpenSort}>
        <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
        Sort
      </Button>
    </div>
  );
}

function UnknownCollection() {
  return (
    <div className="container-page section-y">
      <Seo title="Collection not found" noindex />
      <EmptyState
        title="We could not find that collection"
        actions={<Button to="/shop">Browse all glasses</Button>}
      >
        Check the link or browse everything we have.
      </EmptyState>
    </div>
  );
}

export default function Shop() {
  const { filters, commit, hasUnknownCategory } = useShopFilters();
  const { products, status } = useCatalog();
  const offset = useStickyOffset();
  const [sheet, setSheet] = useState(null);
  const [pagination, setPagination] = useState({ key: "", count: PAGE_SIZE });

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const results = useMemo(() => applyFilters(products, filters), [products, filters]);
  const counts = useMemo(() => facetCounts(products, filters), [products, filters]);
  const presetCounts = useMemo(() => pricePresetCounts(products, filters), [products, filters]);
  const categories = useMemo(() => categoryCounts(products, filters), [products, filters]);

  if (hasUnknownCategory) return <UnknownCollection />;

  const isLoading = status === "loading";
  const isLenses = filters.category === "lenses";
  const visibleCount = pagination.key === filterKey ? pagination.count : PAGE_SIZE;
  const visibleProducts = results.slice(0, visibleCount);
  const activeCount = countActiveFilters(filters);
  const showMore = () => setPagination({ key: filterKey, count: visibleCount + PAGE_SIZE });
  const setSort = (sort) => commit({ ...filters, sort });
  const breadcrumbs = [{ label: "Home", to: "/" }, { label: "Shop", to: filters.category ? "/shop" : undefined }, ...(filters.category ? [{ label: pageTitle(filters.category) }] : [])];

  return (
    <div className="container-page pb-16 pt-6 md:pt-8">
      <Seo
        title={pageTitle(filters.category)}
        description={CATEGORY_COPY[filters.category] ?? DEFAULT_COPY}
        noindex={shouldHideFromSearch(filters)}
      />
      <Breadcrumbs items={breadcrumbs} />
      <header className="mb-5 mt-3 grid gap-2">
        <h1 className="text-3xl md:text-4xl">{pageTitle(filters.category)}</h1>
        <p className="max-w-2xl text-ink-600">{CATEGORY_COPY[filters.category] ?? DEFAULT_COPY}</p>
      </header>
      <CategoryPills filters={filters} onChange={commit} />
      <MobileBar offset={offset} activeCount={activeCount} onOpenFilters={() => setSheet("filters")} onOpenSort={() => setSheet("sort")} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside
          aria-label="Filters"
          style={{ top: offset + 16, maxHeight: `calc(100vh - ${offset + 32}px)` }}
          className="sticky hidden self-start overflow-y-auto pe-2 lg:block"
        >
          <FilterGroups filters={filters} counts={counts} presetCounts={presetCounts} categoryCounts={categories} onChange={commit} />
        </aside>

        <section aria-label="Results" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1 lg:max-w-md">
              <ShopSearch filters={filters} onChange={commit} />
            </div>
            <p role="status" aria-live="polite" className="text-sm font-medium text-ink-600 lg:ms-auto">
              {resultsText(results.length, isLoading)}
            </p>
            <SortSelect sort={filters.sort} onSelect={setSort} />
          </div>
          <div className="mb-6 empty:hidden">
            <ActiveChips filters={filters} onChange={commit} />
          </div>

          {isLoading ? <GridSkeleton /> : null}
          {!isLoading && results.length === 0 ? (
            <NoResults canClear={activeCount > 0 || filters.q.length > 0} onClear={() => commit(clearFilters({ ...filters, q: "" }))} />
          ) : null}
          {!isLoading && results.length > 0 ? (
            <>
              <ProductGrid products={visibleProducts} isLenses={isLenses} />
              {visibleCount < results.length ? (
                <div className="mt-10 flex flex-col items-center gap-2">
                  <p className="text-sm text-ink-600">Showing {visibleProducts.length} of {results.length}</p>
                  <Button variant="secondary" onClick={showMore}>Show more</Button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      </div>

      <FilterSheet open={sheet === "filters"} products={products} initialFilters={filters} onApply={commit} onClose={() => setSheet(null)} />
      <SortSheet open={sheet === "sort"} sort={filters.sort} onSelect={setSort} onClose={() => setSheet(null)} />
    </div>
  );
}
