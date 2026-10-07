import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { COATINGS, LENS_INDEXES, LENS_TREATMENTS, LENS_TYPES, labelOf } from "@shared/enums.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Price } from "@/components/ui/Price.jsx";
import { imageUrl } from "@/lib/images.js";
import { ShareButton, WishlistButton } from "./CardActions.jsx";

const highlightedCoatings = (coatings = []) => coatings.map((value) => labelOf(COATINGS, value)).slice(0, 4);

export function LensCard({ product }) {
  const { lens } = product;
  const specs = [
    labelOf(LENS_TYPES, lens.lensType),
    labelOf(LENS_INDEXES, lens.index),
    labelOf(LENS_TREATMENTS, lens.treatment),
  ];
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-200 bg-cream-50">
      <Link to={`/p/${product.slug}`} className="focus-ring block bg-cream-200">
        <img
          src={imageUrl(product.images[0])}
          alt={product.name}
          width="800"
          height="450"
          loading="lazy"
          decoding="async"
          className="aspect-[16/9] w-full object-contain"
        />
      </Link>
      <WishlistButton product={product} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <ul className="flex flex-wrap gap-1.5" aria-label="Lens specifications">
          {specs.map((spec) => (
            <li key={spec}>
              <Badge tone="teal" className="normal-case tracking-normal">{spec}</Badge>
            </li>
          ))}
        </ul>
        <h3 className="text-lg font-semibold text-ink-900">
          <Link to={`/p/${product.slug}`} className="focus-ring rounded">{product.name}</Link>
        </h3>
        <p className="line-clamp-2 text-sm text-ink-600">{product.description}</p>
        <ul className="grid gap-1 text-sm text-ink-800">
          {highlightedCoatings(lens.coatings).map((coating) => (
            <li key={coating} className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
              {coating}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <div>
            <Price amount={product.price} from size="lg" />
            <p className="text-xs text-ink-600">Added to your frame price</p>
          </div>
          <div className="flex items-center gap-1">
            <ShareButton product={product} />
            <Button to={`/quote/${product.slug}`} size="sm">Get a quote</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
