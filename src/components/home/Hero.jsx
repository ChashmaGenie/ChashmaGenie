import { Link } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";
import { useCatalog } from "@/lib/catalog.jsx";
import { formatPkr } from "@/lib/format.js";
import { Button } from "@/components/ui/Button.jsx";
import { GenieScene3D } from "./GenieScene3D.jsx";

const FLOATING_CARD_IMAGE = "/seed-img/pd-01.webp";

const lowestFramePrice = (products) => {
  const framePrices = products.filter((product) => product.category !== "lenses").map((product) => product.price);
  return framePrices.length > 0 ? Math.min(...framePrices) : null;
};

function MascotPanel() {
  const { products } = useCatalog();
  const startingPrice = lowestFramePrice(products);
  return (
    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[340px]">
      <GenieScene3D />
      {startingPrice ? (
        <Link
          to="/shop"
          className="focus-ring absolute -bottom-4 -start-3 flex items-center gap-3 rounded-xl border border-ink-200 bg-cream-50 p-2 pe-4 shadow-sh-3 sm:-start-8"
        >
          <img src={FLOATING_CARD_IMAGE} alt="" width="56" height="56" className="h-14 w-14 rounded-lg bg-cream-200 object-contain" />
          <span className="flex flex-col">
            <span className="text-xs font-medium text-ink-600">Frames from</span>
            <span className="tabular font-semibold text-ink-900">{formatPkr(startingPrice)}</span>
          </span>
        </Link>
      ) : null}
    </div>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="overflow-hidden bg-cream-100">
      <div className="container-page grid items-center gap-12 py-10 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-12">
        <div className="flex flex-col items-start gap-6">
          <p className="inline-flex min-h-[32px] items-center gap-2 rounded-full bg-teal-100 px-3.5 text-sm font-semibold text-teal-700">
            <Store className="h-4 w-4" aria-hidden="true" />
            Online store &middot; physical store coming soon
          </p>
          <h1 id="hero-title" className="text-3xl md:text-5xl">See the world in style.</h1>
          <p className="max-w-xl text-lg text-ink-600">
            Eyeglasses, sunglasses and prescription lenses, quoted by us and delivered to you.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button to="/shop" size="lg">
              Shop frames
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
            <a href="#how-it-works" className="focus-ring inline-flex min-h-[44px] items-center rounded font-semibold text-sky-700 underline-offset-4 hover:underline">
              How it works
            </a>
          </div>
        </div>
        <MascotPanel />
      </div>
    </section>
  );
}
