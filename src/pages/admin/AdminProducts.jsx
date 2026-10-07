import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PackagePlus, PackageSearch, Plus, RefreshCw, Search, Sparkles, Trash2 } from "lucide-react";
import { Seo } from "@/components/layout/Seo.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Chip } from "@/components/ui/Chip.jsx";
import { EmptyState } from "@/components/ui/EmptyState.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog.jsx";
import { LoadError } from "@/admin/components/LoadError.jsx";
import { PageHeader } from "@/admin/components/PageHeader.jsx";
import { CATALOG_STATUS, useAdminCatalog } from "@/admin/data/AdminCatalog.jsx";
import { sampleProducts } from "@/admin/data/productList.js";
import { friendlyError } from "@/admin/errors.js";
import { DashboardSummary } from "@/admin/product/DashboardSummary.jsx";
import { PRODUCT_FILTERS, filterProducts } from "@/admin/product/productFilters.js";
import { ProductRow } from "@/admin/product/ProductRow.jsx";

function ListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading products">
      {[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-36 w-full" />)}
    </div>
  );
}

function EmptyShop({ onLoadSamples, loading }) {
  return (
    <EmptyState
      icon={PackageSearch}
      title="Your shop is empty"
      actions={
        <>
          <Button onClick={onLoadSamples} loading={loading} variant="secondary">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Load sample catalog
          </Button>
          <Button to="/admin/products/new">
            <PackagePlus className="h-5 w-5" aria-hidden="true" />
            Add your first product
          </Button>
        </>
      }
    >
      Add your first pair of glasses with photos and a price, or load a sample catalog to see how the shop looks. You can delete the samples anytime.
    </EmptyState>
  );
}

export default function AdminProducts() {
  const catalog = useAdminCatalog();
  const { status, products, error, ensureLoaded, load, duplicateProduct, removeProduct, quickToggle, removeSamples, loadSamples } = catalog;
  const toast = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [confirmSamples, setConfirmSamples] = useState(false);
  const [loadingSamples, setLoadingSamples] = useState(false);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const visibleProducts = useMemo(() => filterProducts(products, filter, query), [products, filter, query]);
  const sampleCount = useMemo(() => sampleProducts(products).length, [products]);

  const toggle = (product, patch) =>
    quickToggle(product, patch).catch((failure) => toast.error(friendlyError(failure, "Could not save that change.")));

  const duplicate = async (product) => {
    try {
      const copy = await duplicateProduct(product.id);
      toast.success(`Copied. Now editing "${copy.name}".`);
      navigate(`/admin/products/${copy.id}`);
    } catch (failure) {
      toast.error(friendlyError(failure, "Could not copy that product."));
    }
  };

  const confirmDelete = async () => {
    await removeProduct(toDelete.id);
    toast.success(`Deleted "${toDelete.name}".`);
    setToDelete(null);
  };

  const confirmDeleteSamples = async () => {
    await removeSamples();
    toast.success("Sample products deleted.");
    setConfirmSamples(false);
  };

  const loadSampleCatalog = async () => {
    setLoadingSamples(true);
    try {
      await loadSamples();
      toast.success("Sample catalog loaded.");
    } catch (failure) {
      toast.error(friendlyError(failure, "Could not load the sample catalog."));
    } finally {
      setLoadingSamples(false);
    }
  };

  const isLoading = status === CATALOG_STATUS.idle || (status === CATALOG_STATUS.loading && products.length === 0);

  return (
    <div className="mx-auto max-w-4xl">
      <Seo title="Products" noindex />
      <PageHeader
        title="Products"
        subtitle="Everything you sell. Use the switches to hide an item or mark it sold out."
        actions={
          <>
            <Button to="/admin/products/new" size="sm" className="hidden md:inline-flex">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add new product
            </Button>
            <Button variant="secondary" size="sm" onClick={load} loading={status === CATALOG_STATUS.loading && products.length > 0}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
          </>
        }
      />
      {status === CATALOG_STATUS.ready ? <DashboardSummary products={products} /> : null}
      {isLoading ? <ListSkeleton /> : null}
      {status === CATALOG_STATUS.error && products.length === 0 ? <LoadError error={error} onRetry={load} what="your products" /> : null}
      {status === CATALOG_STATUS.ready && products.length === 0 ? <EmptyShop onLoadSamples={loadSampleCatalog} loading={loadingSamples} /> : null}
      {products.length > 0 ? (
        <>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-600" aria-hidden="true" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name"
              aria-label="Search products"
              className="ps-11"
            />
          </div>
          <div role="group" aria-label="Filter products" className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
            {PRODUCT_FILTERS.map((entry) => (
              <Chip key={entry.value} selected={filter === entry.value} onClick={() => setFilter(entry.value)} className="shrink-0">
                {entry.label}
              </Chip>
            ))}
          </div>
          {sampleCount > 0 ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-500 bg-warn-100 p-3">
              <p className="text-base text-warn-800">{sampleCount} sample {sampleCount === 1 ? "product is" : "products are"} in your shop for demonstration.</p>
              <Button variant="secondary" size="sm" onClick={() => setConfirmSamples(true)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete all sample products ({sampleCount})
              </Button>
            </div>
          ) : null}
          <p className="mb-3 text-sm text-ink-600" aria-live="polite">Showing {visibleProducts.length} of {products.length}</p>
          {visibleProducts.length === 0 ? (
            <EmptyState icon={PackageSearch} title="Nothing matches" actions={<Button variant="secondary" onClick={() => { setFilter("all"); setQuery(""); }}>Clear search and filters</Button>}>
              Try a different word or choose All.
            </EmptyState>
          ) : (
            <ul className="space-y-3 pb-20">
              {visibleProducts.map((product) => (
                <ProductRow key={product.id} product={product} onToggle={toggle} onDuplicate={duplicate} onDelete={setToDelete} />
              ))}
            </ul>
          )}
        </>
      ) : null}
      <Link
        to="/admin/products/new"
        className="focus-ring fixed bottom-20 end-4 z-30 inline-flex min-h-[56px] items-center gap-2 rounded-full bg-gold-400 px-6 text-lg font-semibold text-ink-800 shadow-sh-3 hover:bg-gold-500 md:hidden"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
        Add new product
      </Link>
      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        title="Delete this product?"
        confirmLabel="Yes, delete it"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p>"{toDelete?.name}" and its photos will be removed from your shop. This cannot be undone.</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={confirmSamples}
        danger
        title="Delete all sample products?"
        confirmLabel={`Yes, delete ${sampleCount}`}
        onConfirm={confirmDeleteSamples}
        onCancel={() => setConfirmSamples(false)}
      >
        <p>This removes {sampleCount} sample {sampleCount === 1 ? "product" : "products"}. Products you added yourself stay.</p>
      </ConfirmDialog>
    </div>
  );
}
