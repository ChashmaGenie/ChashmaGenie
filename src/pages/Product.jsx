import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import { CATEGORIES, labelOf } from "@shared/enums.js";
import { Breadcrumbs, Button, EmptyState, Skeleton } from "@/components/ui/index.js";
import { Seo } from "@/components/layout/Seo.jsx";
import { ProductCard } from "@/components/catalog/ProductCard.jsx";
import { BuyBox } from "@/components/product/BuyBox.jsx";
import { FaceShapeHelp } from "@/components/product/FaceShapeHelp.jsx";
import { ProductAccordions } from "@/components/product/ProductAccordions.jsx";
import { ProductGallery } from "@/components/product/ProductGallery.jsx";
import { RelatedItems } from "@/components/product/RelatedItems.jsx";
import { StickyCta } from "@/components/product/StickyCta.jsx";
import { buildProductJsonLd } from "@/components/product/productJsonLd.js";
import { pageUrl } from "@/components/product/productLinks.js";
import { ShareButtons } from "@/components/social/ShareButtons.jsx";
import { useCatalog } from "@/lib/catalog.jsx";
import { imageUrl } from "@/lib/images.js";
import { trackPixel } from "@/lib/pixel.js";
import { useSettings } from "@/lib/settings.jsx";

const META_DESCRIPTION_LIMIT = 155;
const SUGGESTION_COUNT = 4;

const metaDescription = (product) => {
  const text = product.description || `${product.name} from ChashmaGenie. Get a quote with your prescription.`;
  return text.length > META_DESCRIPTION_LIMIT ? `${text.slice(0, META_DESCRIPTION_LIMIT - 1).trimEnd()}...` : text;
};

const initialSelection = (product) => ({ colorKey: product.colors[0] ?? "", sizeIndex: 0 });

function ProductSkeleton() {
  return (
    <div className="container-page py-8" role="status" aria-label="Loading product">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

function ProductNotFound({ products }) {
  const suggestions = [...products].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, SUGGESTION_COUNT);
  return (
    <div className="container-page section-y">
      <Seo title="Product not found" noindex />
      <EmptyState
        icon={SearchX}
        title="We could not find that product"
        actions={<Button to="/shop">Browse the shop</Button>}
      >
        It may have been removed or the link may be out of date.
      </EmptyState>
      {suggestions.length > 0 ? (
        <section aria-labelledby="suggestions-heading" className="mt-8">
          <h2 id="suggestions-heading" className="mb-6 text-2xl">You might like these</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {suggestions.map((item) => <ProductCard key={item.slug} product={item} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ProductView({ product, products }) {
  const settings = useSettings();
  const ctaRef = useRef(null);
  const [selection, setSelection] = useState(() => initialSelection(product));
  const [faceHelpOpen, setFaceHelpOpen] = useState(false);
  const categoryLabel = labelOf(CATEGORIES, product.category);

  useEffect(() => {
    trackPixel("ViewContent", { content_ids: [product.id], content_type: "product" });
  }, [product.id]);

  const updateSelection = (patch) => setSelection((current) => ({ ...current, ...patch }));

  return (
    <div className="container-page pb-12 pt-4 md:pt-6">
      <Seo
        title={product.name}
        description={metaDescription(product)}
        image={imageUrl(product.images[0])}
        path={`/p/${product.slug}`}
        type="product"
        jsonLd={buildProductJsonLd(product, window.location.origin)}
      />
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: categoryLabel, to: `/shop/${product.category}` },
          { label: product.name },
        ]}
      />
      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-x-12">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <ProductGallery images={product.images} name={product.name} />
        </div>
        <div className="min-w-0 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <BuyBox
            product={product}
            settings={settings}
            selection={selection}
            onSelect={updateSelection}
            onOpenFaceHelp={() => setFaceHelpOpen(true)}
            ctaRef={ctaRef}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-8 lg:col-start-1 lg:row-start-2">
          <ProductAccordions product={product} settings={settings} />
          <section aria-labelledby="share-heading" className="flex flex-col gap-3">
            <h2 id="share-heading" className="text-lg">Share this {product.category === "lenses" ? "lens" : "frame"}</h2>
            <ShareButtons title={product.name} url={pageUrl(product)} />
          </section>
        </div>
      </div>
      <RelatedItems product={product} products={products} />
      <FaceShapeHelp open={faceHelpOpen} onClose={() => setFaceHelpOpen(false)} product={product} />
      <StickyCta product={product} settings={settings} selection={selection} ctaRef={ctaRef} />
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();
  const { products, status, bySlug } = useCatalog();
  const product = bySlug(slug);
  if (product) return <ProductView key={product.slug} product={product} products={products} />;
  return status === "loading" ? <ProductSkeleton /> : <ProductNotFound products={products} />;
}
