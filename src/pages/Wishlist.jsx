import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { Seo } from "@/components/layout/Seo.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { EmptyState } from "@/components/ui/EmptyState.jsx";
import { Price } from "@/components/ui/Price.jsx";
import { ProductCardSkeleton } from "@/components/ui/Skeleton.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { useBasket } from "@/lib/basket.jsx";
import { useCatalog } from "@/lib/catalog.jsx";
import { imageUrl } from "@/lib/images.js";
import { useWishlist } from "@/lib/wishlist.jsx";

function WishlistItem({ product, inBasket, onAddToQuote, onRemove }) {
  return (
    <li className="flex gap-4 rounded-xl border border-ink-200 bg-cream-50 p-3 sm:p-4">
      <Link to={`/p/${product.slug}`} className="focus-ring block w-28 shrink-0 self-start overflow-hidden rounded-lg bg-cream-200 sm:w-40">
        <img src={imageUrl(product.images[0])} alt={product.name} width="400" height="300" loading="lazy" className="aspect-[4/3] w-full object-contain" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 className="font-sans text-base font-semibold text-ink-900">
          <Link to={`/p/${product.slug}`} className="focus-ring rounded">{product.name}</Link>
        </h2>
        <Price amount={product.price} compareAt={product.compareAtPrice} from={product.category === "lenses"} />
        <div className="mt-auto flex flex-wrap gap-2">
          <Button size="sm" variant={inBasket ? "secondary" : "primary"} onClick={() => onAddToQuote(product)}>
            {inBasket ? "In your quote" : "Add to quote"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onRemove(product)} aria-label={`Remove ${product.name} from wishlist`}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remove
          </Button>
        </div>
      </div>
    </li>
  );
}

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3" role="status" aria-label="Loading wishlist">
      {Array.from({ length: 3 }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function Wishlist() {
  const wishlist = useWishlist();
  const basket = useBasket();
  const toast = useToast();
  const { bySlug, status } = useCatalog();

  const saved = wishlist.slugs.map(bySlug).filter(Boolean);
  const isLoading = status === "loading";

  const addToQuote = (product) => {
    if (basket.has(product.slug)) return toast.success("Already in your quote");
    if (basket.isFull) return toast.error("Your quote has 5 items. Remove one to add another.");
    basket.add({ slug: product.slug });
    toast.success(`${product.name} added to your quote`);
  };

  const remove = (product) => {
    wishlist.remove(product.slug);
    toast.success(`${product.name} removed`);
  };

  return (
    <div className="container-page section-y">
      <Seo title="Your wishlist" noindex />
      <h1 className="text-3xl md:text-4xl">Your wishlist</h1>
      <p className="mb-8 mt-2 text-ink-600">Saved on this device only. Add pairs to your quote when you are ready.</p>
      {isLoading ? <WishlistSkeleton /> : null}
      {!isLoading && saved.length === 0 ? (
        <EmptyState icon={Heart} title="Nothing saved yet" actions={<Button to="/shop">Browse glasses</Button>}>
          Tap the heart on any pair to keep it here.
        </EmptyState>
      ) : null}
      {!isLoading && saved.length > 0 ? (
        <>
          <ul className="grid gap-4 lg:grid-cols-2">
            {saved.map((product) => (
              <WishlistItem key={product.slug} product={product} inBasket={basket.has(product.slug)} onAddToQuote={addToQuote} onRemove={remove} />
            ))}
          </ul>
          {basket.count > 0 ? (
            <div className="mt-8 flex justify-end">
              <Button to="/quote" size="lg">Review your quote ({basket.count})</Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
