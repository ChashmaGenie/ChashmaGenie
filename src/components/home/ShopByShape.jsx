import { Link } from "react-router-dom";
import { SHAPES } from "@shared/enums.js";
import { Container } from "@/components/ui/Container.jsx";
import { SectionHeading } from "./SectionHeading.jsx";
import { ShapeIcon } from "./ShapeIcon.jsx";

export function ShopByShape() {
  return (
    <section aria-labelledby="shape-title" className="py-10 md:py-16">
      <Container>
        <SectionHeading id="shape-title" eyebrow="Find your frame" title="Shop by shape" action={{ label: "All frames", to: "/shop" }} />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
          {SHAPES.map(({ value, label }) => (
            <li key={value}>
              <Link
                to={`/shop?shape=${value}`}
                className="focus-ring flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-xl border border-ink-200 bg-cream-50 p-3 text-ink-800 transition-colors duration-150 hover:border-ink-800 hover:bg-cream-200"
              >
                <ShapeIcon shape={value} className="h-8 w-auto" />
                <span className="text-sm font-semibold">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
