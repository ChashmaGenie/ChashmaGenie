import { useMemo } from "react";
import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { Seo } from "@/components/layout/Seo.jsx";
import { SearchBox } from "@/components/layout/SearchBox.jsx";
import { PRIMARY_NAV } from "@/components/layout/navData.js";
import { ProductCard } from "@/components/catalog/ProductCard.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { useCatalog } from "@/lib/catalog.jsx";

const SUGGESTION_COUNT = 4;

const suggestionsFrom = (products) =>
  products
    .filter((product) => product.category !== "lenses")
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, SUGGESTION_COUNT);

export default function NotFound() {
  const { products } = useCatalog();
  const suggestions = useMemo(() => suggestionsFrom(products), [products]);
  return (
    <Container className="py-10 md:py-16">
      <Seo title="Page not found" noindex />
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-cream-200 text-ink-800">
          <SearchX className="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 className="text-3xl md:text-4xl">This page made a wish and vanished</h1>
        <p className="text-ink-600">We could not find what you were looking for. Search for a pair, or pick a category below.</p>
        <SearchBox className="w-full" />
        <ul className="flex flex-wrap justify-center gap-2">
          {PRIMARY_NAV.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="focus-ring inline-flex min-h-[44px] items-center rounded-full border border-ink-300 bg-cream-50 px-4 text-sm font-medium hover:bg-ink-100">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Button to="/">Back to home</Button>
      </div>
      {suggestions.length > 0 ? (
        <section aria-labelledby="not-found-picks" className="mt-12">
          <h2 id="not-found-picks" className="mb-6 text-2xl">You might like</h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {suggestions.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
