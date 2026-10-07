import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BADGES, labelOf } from "@shared/enums.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Price } from "@/components/ui/Price.jsx";
import { imageUrl } from "@/lib/images.js";
import { ShareButton, WishlistButton } from "./CardActions.jsx";
import { ColorSwatches } from "./ColorSwatches.jsx";
import { LensCard } from "./LensCard.jsx";

const STOCK_TAGS = { made_to_order: "Made to order", out_of_stock: "Out of stock" };

export const displayBadge = (badges) => {
  if (badges.includes("bestseller")) return "bestseller";
  return badges.includes("new") ? "new" : null;
};

function CardImages({ product }) {
  const [mainImage, hoverImage] = product.images;
  const badge = displayBadge(product.badges);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-ink-200 bg-cream-200">
      <img src={imageUrl(mainImage)} alt={product.name} width="800" height="600" loading="lazy" decoding="async" className="h-full w-full object-contain" />
      {hoverImage ? (
        <img
          src={imageUrl(hoverImage)}
          alt=""
          width="800"
          height="600"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 hidden h-full w-full object-contain opacity-0 transition-opacity duration-300 md:block md:group-hover:opacity-100 md:group-focus-within:opacity-100"
        />
      ) : null}
      {badge ? (
        <Badge tone={badge === "bestseller" ? "gold" : "ink"} className="absolute start-3 top-3">
          {labelOf(BADGES, badge)}
        </Badge>
      ) : null}
    </div>
  );
}

function FrameCard({ product }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const stockTag = STOCK_TAGS[product.stock];
  return (
    <article className="group relative flex h-full flex-col gap-2">
      <Link to={`/p/${product.slug}`} className="focus-ring flex flex-col gap-3 rounded-xl">
        <CardImages product={product} />
        <div className="flex flex-col gap-1 px-0.5">
          <h3 className="text-base font-semibold text-ink-900">{product.name}</h3>
          <Price amount={product.price} compareAt={product.compareAtPrice} />
          {stockTag ? <p className="text-sm font-medium text-warn-800">{stockTag}</p> : null}
        </div>
      </Link>
      <WishlistButton product={product} />
      <div className="mt-auto flex flex-col gap-1 px-0.5">
        {product.colors.length > 0 ? (
          <ColorSwatches colors={product.colors} selected={selectedColor} onSelect={setSelectedColor} />
        ) : null}
        <div className="flex items-center justify-between">
          <Link
            to={`/quote/${product.slug}`}
            className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            Get a quote <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
          <ShareButton product={product} />
        </div>
      </div>
    </article>
  );
}

function ProductCardBase({ product }) {
  return product.category === "lenses" ? <LensCard product={product} /> : <FrameCard product={product} />;
}

export const ProductCard = memo(ProductCardBase);
export default ProductCard;
