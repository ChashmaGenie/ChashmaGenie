import { Link } from "react-router-dom";
import { useCatalog } from "@/lib/catalog.jsx";
import { useSettings } from "@/lib/settings.jsx";
import { firstImageUrl } from "@/lib/images.js";
import { formatPkr } from "@/lib/format.js";

const resolveLooks = (lookbook, bySlug) =>
  lookbook
    .map((look) => ({ ...look, product: bySlug(look.productSlug) }))
    .filter((look) => look.product);

function LookTile({ look }) {
  const { product, caption } = look;
  return (
    <Link to={`/p/${product.slug}`} className="focus-ring group flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-cream-50">
      <img
        src={firstImageUrl(product)}
        alt={product.name}
        width="800"
        height="600"
        loading="lazy"
        className="aspect-[4/3] w-full bg-cream-200 object-contain transition-transform duration-300 group-hover:scale-105"
      />
      <span className="flex flex-col gap-0.5 p-3">
        <span className="text-sm font-semibold text-ink-900">{caption || product.name}</span>
        <span className="tabular text-sm text-ink-600">{formatPkr(product.price)}</span>
      </span>
    </Link>
  );
}

export function ShopTheLook() {
  const { lookbook } = useSettings();
  const { bySlug } = useCatalog();
  const looks = resolveLooks(lookbook ?? [], bySlug);
  if (looks.length === 0) return null;
  return (
    <div className="mt-10">
      <h3 className="mb-4 text-2xl font-display font-semibold">Shop the look</h3>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {looks.map((look) => (
          <li key={look.id ?? look.productSlug}>
            <LookTile look={look} />
          </li>
        ))}
      </ul>
    </div>
  );
}
