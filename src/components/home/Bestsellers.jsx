import { useMemo } from "react";
import { useCatalog } from "@/lib/catalog.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { ProductCardSkeleton } from "@/components/ui/Skeleton.jsx";
import { ProductCard } from "@/components/catalog/ProductCard.jsx";
import { SectionHeading } from "./SectionHeading.jsx";

const MAX_ITEMS = 8;
const SKELETON_COUNT = 4;

const byCreatedDesc = (a, b) => String(b.createdAt).localeCompare(String(a.createdAt));

const isFrame = (product) => product.category !== "lenses";

const pickHighlights = (products) => {
  const frames = products.filter(isFrame);
  const bestsellers = frames.filter((product) => product.badges.includes("bestseller"));
  const featured = frames.filter((product) => product.featured && !bestsellers.includes(product));
  const newest = [...frames].sort(byCreatedDesc);
  const ranked = [...bestsellers, ...featured, ...newest];
  return [...new Map(ranked.map((product) => [product.id, product])).values()].slice(0, MAX_ITEMS);
};

const hasBestsellers = (products) => products.some((product) => isFrame(product) && product.badges.includes("bestseller"));

export function Bestsellers() {
  const { products, status } = useCatalog();
  const highlights = useMemo(() => pickHighlights(products), [products]);
  const title = hasBestsellers(products) || status === "loading" ? "Bestsellers" : "Fresh picks";

  if (status !== "loading" && highlights.length === 0) return null;

  return (
    <section aria-labelledby="bestsellers-title" className="py-10 md:py-16">
      <Container>
        <SectionHeading id="bestsellers-title" eyebrow="Loved by our customers" title={title} action={{ label: "Shop all", to: "/shop" }} />
        {status === "loading" ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4" role="status" aria-label="Loading frames">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <ul className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
            {highlights.map((product) => (
              <li key={product.id} className="w-[68%] shrink-0 snap-start sm:w-[44%] md:w-auto">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
