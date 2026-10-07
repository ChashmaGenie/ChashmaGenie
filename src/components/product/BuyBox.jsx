import { Link } from "react-router-dom";
import { Banknote, Check, Heart, MessageCircle, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { BADGES, COLORS, FACE_SHAPES, SIZE_LABELS, deriveSizeLabel, labelOf } from "@shared/enums.js";
import { Badge, Button, Chip, IconButton, Price, WhatsAppIcon, useToast } from "@/components/ui/index.js";
import { formatPkr } from "@/lib/format.js";
import { useBasket } from "@/lib/basket.jsx";
import { useWishlist } from "@/lib/wishlist.jsx";
import { trackPixel } from "@/lib/pixel.js";
import { cn } from "@/lib/cn.js";
import { askLink, notifyLink, quoteLink } from "./productLinks.js";
import { sizeText } from "@/components/quote/quoteRules.js";

const displayBadge = (badges) => (badges.includes("bestseller") ? "bestseller" : badges.includes("new") ? "new" : null);

const swatchStyle = (colorKey) => {
  const color = COLORS.find((entry) => entry.value === colorKey);
  return { background: color?.gradient ?? color?.hex ?? "#111111" };
};

function ColourPicker({ colors, selected, onSelect }) {
  if (colors.length === 0) return null;
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold text-ink-900">Colour: <span className="font-normal text-ink-600">{labelOf(COLORS, selected)}</span></legend>
      <div className="flex flex-wrap gap-1">
        {colors.map((colorKey) => (
          <button
            key={colorKey}
            type="button"
            aria-pressed={colorKey === selected}
            aria-label={labelOf(COLORS, colorKey)}
            onClick={() => onSelect(colorKey)}
            className={cn("focus-ring grid h-11 w-11 place-items-center rounded-full border-2", colorKey === selected ? "border-ink-900" : "border-transparent")}
          >
            <span className="block h-7 w-7 rounded-full border border-ink-300" style={swatchStyle(colorKey)} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function SizePicker({ sizes, selectedIndex, onSelect }) {
  if (sizes.length === 0) return null;
  const selected = sizes[selectedIndex];
  const fitLabel = labelOf(SIZE_LABELS, deriveSizeLabel(selected.lens));
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink-900">Size: <span className="font-normal text-ink-600">{fitLabel} fit, {selected.lens} mm lenses</span></legend>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size, index) => (
          <Chip key={sizeText(size)} selected={index === selectedIndex} onClick={() => onSelect(index)} className="tabular">{sizeText(size)}</Chip>
        ))}
      </div>
    </fieldset>
  );
}

function FaceHint({ product, onOpenHelp }) {
  if (product.category === "lenses") return null;
  const labels = product.faceShapes.map((shape) => labelOf(FACE_SHAPES, shape));
  return (
    <div className="text-sm text-ink-600">
      {labels.length > 0 ? <p>Pairs well with: <strong className="text-ink-800">{labels.join(", ")}</strong> faces</p> : null}
      <button type="button" onClick={onOpenHelp} className="focus-ring min-h-[44px] text-sky-700 underline">Not sure of your face shape?</button>
    </div>
  );
}

function PriceBlock({ product, settings }) {
  const isLens = product.category === "lenses";
  const threshold = settings.freeShippingThreshold;
  return (
    <div className="flex flex-col gap-1">
      <Price amount={product.price} compareAt={product.compareAtPrice} from={isLens} size="hero" />
      <p className="text-sm text-ink-600">
        {isLens ? "Add-on price for this lens package. The owner confirms the final price." : "Frame price. Lenses are quoted separately once you add your prescription."}
      </p>
      {threshold > 0 ? <p className="text-sm font-medium text-teal-700">Free delivery on orders above {formatPkr(threshold)}.</p> : null}
    </div>
  );
}

function BasketButton({ product, colorKey, sizeIndex }) {
  const basket = useBasket();
  const toast = useToast();
  const inQuote = basket.has(product.slug);
  const handleClick = () => {
    if (!inQuote && basket.isFull) return toast.error("Your quote can include up to 5 frames. Remove one to add this.");
    basket.add({ slug: product.slug, colorKey, sizeIndex });
    return toast.success(inQuote ? "Quote selection updated" : "Added to your quote");
  };
  return (
    <Button variant="secondary" onClick={handleClick} className="flex-1">
      {inQuote ? <Check className="h-5 w-5" aria-hidden="true" /> : null}
      {inQuote ? "Update in quote" : "Add to quote"}
    </Button>
  );
}

function WishlistButton({ product }) {
  const wishlist = useWishlist();
  const saved = wishlist.has(product.slug);
  const toggle = () => {
    if (!saved) trackPixel("AddToWishlist", { content_ids: [product.id] });
    wishlist.toggle(product.slug);
  };
  return (
    <IconButton
      label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      variant="secondary"
      onClick={toggle}
      className="h-12 w-12"
    >
      <Heart className={cn("h-5 w-5", saved && "fill-danger-600 text-danger-600")} aria-hidden="true" />
    </IconButton>
  );
}

function Actions({ product, settings, colorKey, sizeIndex, ctaRef }) {
  const isLens = product.category === "lenses";
  const soldOut = product.stock === "out_of_stock";
  const toQuote = quoteLink(product, colorKey, sizeIndex);
  const ask = askLink(settings, product);
  const onAsk = () => trackPixel("Contact", { content_ids: [product.id] });
  return (
    <div className="flex flex-col gap-3">
      {soldOut ? (
        <>
          <Button ref={ctaRef} href={notifyLink(settings, product)} size="lg" fullWidth>Notify me when available</Button>
          <Button to={toQuote} variant="secondary" fullWidth>Request a quote anyway</Button>
        </>
      ) : (
        <Button ref={ctaRef} to={toQuote} size="lg" fullWidth>{isLens ? "Choose this lens" : "Select lenses"}</Button>
      )}
      {ask ? (
        <Button href={ask} target="_blank" rel="noopener noreferrer" variant="teal" fullWidth onClick={onAsk}>
          <WhatsAppIcon className="h-5 w-5" />
          Ask on WhatsApp
        </Button>
      ) : null}
      <div className="flex gap-3">
        {isLens ? null : <BasketButton product={product} colorKey={colorKey} sizeIndex={sizeIndex} />}
        <WishlistButton product={product} />
      </div>
    </div>
  );
}

function ServiceLines({ settings }) {
  const lines = [
    [Truck, settings.shippingText],
    [Banknote, settings.codText],
    [RotateCcw, settings.returnsText],
    [ShieldCheck, settings.warrantyText],
  ].filter(([, text]) => text);
  return (
    <ul className="grid gap-2 border-t border-ink-200 pt-4 text-sm text-ink-800">
      {lines.map(([Icon, text]) => (
        <li key={text} className="flex gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
          {text}
        </li>
      ))}
      <li className="flex gap-3">
        <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
        Your lenses are confirmed with you before anything is ordered.
      </li>
      {settings.comingSoonEnabled ? <li className="ps-8 text-ink-600">Online store. Our physical store is coming soon.</li> : null}
    </ul>
  );
}

export function BuyBox({ product, settings, selection, onSelect, onOpenFaceHelp, ctaRef }) {
  const badge = displayBadge(product.badges);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {badge ? <Badge tone={badge === "bestseller" ? "gold" : "ink"} className="self-start">{labelOf(BADGES, badge)}</Badge> : null}
        <h1 className="text-3xl md:text-4xl">{product.name}</h1>
        <p className="text-sm text-ink-600">by {product.brand}{product.stock === "made_to_order" ? " - made to order" : ""}</p>
      </div>
      <PriceBlock product={product} settings={settings} />
      <ColourPicker colors={product.colors} selected={selection.colorKey} onSelect={(colorKey) => onSelect({ colorKey })} />
      <SizePicker sizes={product.sizes} selectedIndex={selection.sizeIndex} onSelect={(sizeIndex) => onSelect({ sizeIndex })} />
      <FaceHint product={product} onOpenHelp={onOpenFaceHelp} />
      <Actions product={product} settings={settings} colorKey={selection.colorKey} sizeIndex={selection.sizeIndex} ctaRef={ctaRef} />
      <ServiceLines settings={settings} />
      <p className="text-sm text-ink-600">
        Quotes are estimates, not medical advice. <Link to="/privacy" className="text-sky-700 underline">Privacy</Link>
      </p>
    </div>
  );
}
