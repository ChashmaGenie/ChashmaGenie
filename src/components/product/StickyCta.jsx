import { useEffect, useState } from "react";
import { Button, WhatsAppIcon } from "@/components/ui/index.js";
import { askLink, notifyLink, quoteLink } from "./productLinks.js";

const observeVisibility = (element, onChange) => {
  if (!element || typeof IntersectionObserver === "undefined") return () => undefined;
  const observer = new IntersectionObserver(([entry]) => onChange(entry.isIntersecting));
  observer.observe(element);
  return () => observer.disconnect();
};

function useShouldHide(ctaRef) {
  const [ctaVisible, setCtaVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  useEffect(() => observeVisibility(ctaRef.current, setCtaVisible), [ctaRef]);
  useEffect(() => observeVisibility(document.querySelector("footer"), setFooterVisible), []);
  return ctaVisible || footerVisible;
}

export function StickyCta({ product, settings, selection, ctaRef }) {
  const hidden = useShouldHide(ctaRef);
  const soldOut = product.stock === "out_of_stock";
  const ask = askLink(settings, product);
  const primary = soldOut
    ? { href: notifyLink(settings, product), label: "Notify me" }
    : { to: quoteLink(product, selection.colorKey, selection.sizeIndex), label: product.category === "lenses" ? "Choose this lens" : "Select lenses" };
  return (
    <div
      hidden={hidden}
      className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-ink-200 bg-cream-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-sh-3 md:hidden"
    >
      <div className="min-w-0 flex-1">
        <Button {...primary} fullWidth>{primary.label}</Button>
      </div>
      {ask ? (
        <Button href={ask} target="_blank" rel="noopener noreferrer" variant="teal" aria-label="Ask on WhatsApp" className="w-12 px-0">
          <WhatsAppIcon className="h-6 w-6" />
        </Button>
      ) : null}
    </div>
  );
}
