import { useMemo } from "react";
import { ProductCard } from "@/components/catalog/ProductCard.jsx";

const RELATED_LIMIT = 4;

const relevance = (product, candidate) => {
  const sameCategory = candidate.category === product.category ? 2 : 0;
  const sameShape = product.shape && candidate.shape === product.shape ? 1 : 0;
  return sameCategory + sameShape;
};

export const pickRelated = (product, products) =>
  products
    .filter((candidate) => candidate.slug !== product.slug)
    .map((candidate) => ({ candidate, score: relevance(product, candidate) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Number(b.candidate.featured) - Number(a.candidate.featured))
    .slice(0, RELATED_LIMIT)
    .map(({ candidate }) => candidate);

export function RelatedItems({ product, products }) {
  const related = useMemo(() => pickRelated(product, products), [product, products]);
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="mt-16">
      <h2 id="related-heading" className="mb-6 text-2xl md:text-3xl">You may also like</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {related.map((item) => <ProductCard key={item.slug} product={item} />)}
      </div>
    </section>
  );
}
