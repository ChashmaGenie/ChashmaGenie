import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { EmptyState } from "@/components/ui/EmptyState.jsx";
import { ProductCardSkeleton } from "@/components/ui/Skeleton.jsx";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon.jsx";
import { useSettings } from "@/lib/settings.jsx";
import { waLink } from "@/lib/whatsapp.js";
import { cn } from "@/lib/cn.js";
import { ProductCard } from "./ProductCard.jsx";

const SKELETON_COUNT = 12;
const LENS_GRID = "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
const FRAME_GRID = "grid-cols-2 md:grid-cols-3 xl:grid-cols-4";

const gridClasses = (isLenses) => cn("grid gap-x-3 gap-y-8 md:gap-x-5", isLenses ? LENS_GRID : FRAME_GRID);

export function GridSkeleton() {
  return (
    <div className={gridClasses(false)} role="status" aria-label="Loading glasses">
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function NoResults({ canClear, onClear }) {
  const { whatsappNumber } = useSettings();
  return (
    <EmptyState
      icon={SearchX}
      title="No glasses match"
      actions={
        <>
          {canClear ? <Button onClick={onClear}>Clear filters</Button> : null}
          <Button to="/quote" variant="secondary">Request a custom pair</Button>
          {whatsappNumber ? (
            <Button href={waLink(whatsappNumber, "Assalam o Alaikum! I could not find the glasses I want. Can you help?")} target="_blank" rel="noopener noreferrer" variant="teal">
              <WhatsAppIcon /> Ask us on WhatsApp
            </Button>
          ) : null}
        </>
      }
    >
      Try removing a filter or searching with fewer words. We can also source a pair for you.
    </EmptyState>
  );
}

export function ProductGrid({ products, isLenses }) {
  return (
    <ul className={gridClasses(isLenses)}>
      {products.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
