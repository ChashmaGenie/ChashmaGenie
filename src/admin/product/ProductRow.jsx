import { Link } from "react-router-dom";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { CATEGORIES, labelOf } from "@shared/enums.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { formatPkr } from "@/lib/format.js";
import { firstImageUrl } from "@/lib/images.js";
import { RowMenu } from "@/admin/components/RowMenu.jsx";
import { SwitchRow } from "@/admin/components/SwitchRow.jsx";
import { IN_STOCK_PATCH, OUT_OF_STOCK_PATCH } from "@/admin/data/productList.js";

export function ProductRow({ product, onToggle, onDuplicate, onDelete }) {
  const inStock = product.stock !== "out_of_stock";
  const thumbnail = firstImageUrl(product);
  const menuItems = [
    { label: "Edit", icon: Pencil, to: `/admin/products/${product.id}` },
    { label: "Duplicate", icon: Copy, onSelect: () => onDuplicate(product) },
    { label: "Delete", icon: Trash2, danger: true, onSelect: () => onDelete(product) },
  ];
  return (
    <li className="rounded-xl border border-ink-200 bg-cream-50 p-3 md:p-4">
      <div className="flex items-start gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-200 md:h-24 md:w-24">
          {thumbnail ? <img src={thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">
            <Link to={`/admin/products/${product.id}`} className="focus-ring inline-flex min-h-[44px] max-w-full items-center truncate rounded hover:underline">{product.name}</Link>
          </h3>
          <p className="tabular text-base font-semibold">{formatPkr(product.price)}</p>
          <p className="text-sm text-ink-600">{labelOf(CATEGORIES, product.category)}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {product.sample ? <Badge tone="warn">Sample</Badge> : null}
            {product.visible === false ? <Badge tone="neutral">Hidden</Badge> : null}
            {product.stock === "out_of_stock" ? <Badge tone="danger">Out of stock</Badge> : null}
          </div>
        </div>
        <RowMenu label={`More options for ${product.name}`} items={menuItems} />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-x-6 border-t border-ink-200 pt-1 sm:grid-cols-3">
        <SwitchRow compact label="Visible" checked={product.visible !== false} onChange={(visible) => onToggle(product, { visible })} />
        <SwitchRow compact label="Featured" checked={product.featured === true} onChange={(featured) => onToggle(product, { featured })} />
        <SwitchRow compact label="In stock" checked={inStock} onChange={(on) => onToggle(product, on ? IN_STOCK_PATCH : OUT_OF_STOCK_PATCH)} />
      </div>
    </li>
  );
}
