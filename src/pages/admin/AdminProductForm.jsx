import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { Seo } from "@/components/layout/Seo.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { EmptyState } from "@/components/ui/EmptyState.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";
import { LoadError } from "@/admin/components/LoadError.jsx";
import { CATALOG_STATUS, useAdminCatalog } from "@/admin/data/AdminCatalog.jsx";
import { ProductEditor } from "@/admin/product/ProductEditor.jsx";

function FormHeader({ title }) {
  return (
    <div className="mx-auto mb-5 max-w-3xl">
      <Link to="/admin/products" className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-lg text-base font-semibold text-sky-700">
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        All products
      </Link>
      <h1 className="text-3xl">{title}</h1>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4" role="status" aria-label="Loading product">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function AdminProductForm() {
  const { id } = useParams();
  const { status, products, error, ensureLoaded, load } = useAdminCatalog();
  const product = id ? products.find((entry) => entry.id === id) : undefined;

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const title = id ? "Edit product" : "Add a product";
  const waiting = id && !product && (status === CATALOG_STATUS.idle || status === CATALOG_STATUS.loading);

  return (
    <>
      <Seo title={title} noindex />
      <FormHeader title={title} />
      {waiting ? <FormSkeleton /> : null}
      {id && !product && status === CATALOG_STATUS.error ? <LoadError error={error} onRetry={load} what="this product" /> : null}
      {id && !product && status === CATALOG_STATUS.ready ? (
        <EmptyState icon={PackageSearch} title="We could not find that product" actions={<Button to="/admin/products">Back to products</Button>}>
          It may have been deleted.
        </EmptyState>
      ) : null}
      {!id ? <ProductEditor key="new" /> : null}
      {product ? <ProductEditor key={product.id} product={product} /> : null}
    </>
  );
}
