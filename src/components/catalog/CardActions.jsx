import { Heart, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast.jsx";
import { useWishlist } from "@/lib/wishlist.jsx";
import { cn } from "@/lib/cn.js";
import { shareProduct } from "./shareProduct.js";

const ACTION_FEEDBACK = {
  copied: (toast) => toast.success("Link copied"),
  failed: (toast) => toast.error("Could not share this pair. Try copying the link from the product page."),
};

const roundButton = "focus-ring grid h-11 w-11 place-items-center rounded-full text-ink-800 transition-colors duration-150";
const overlayButton = "bg-cream-50/90 shadow-sh-1 hover:bg-cream-50";
const plainButton = "hover:bg-ink-100";

function useShare(product) {
  const toast = useToast();
  return async () => {
    const outcome = await shareProduct(product);
    ACTION_FEEDBACK[outcome]?.(toast);
  };
}

export function WishlistButton({ product }) {
  const wishlist = useWishlist();
  const saved = wishlist.has(product.slug);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      onClick={() => wishlist.toggle(product.slug)}
      className={cn(roundButton, overlayButton, "absolute end-2 top-2")}
    >
      <Heart className={cn("h-5 w-5", saved && "fill-danger-600 text-danger-600")} aria-hidden="true" />
    </button>
  );
}

export function ShareButton({ product }) {
  const share = useShare(product);
  return (
    <button type="button" aria-label={`Share ${product.name}`} onClick={share} className={cn(roundButton, plainButton)}>
      <Share2 className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
