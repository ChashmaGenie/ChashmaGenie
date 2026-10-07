import { Link } from "react-router-dom";
import { BookOpen, Car, Monitor, Smile } from "lucide-react";
import { Container } from "@/components/ui/Container.jsx";
import { SectionHeading } from "./SectionHeading.jsx";

const USES = [
  { label: "Computer", blurb: "Blue-light and screen-friendly frames", to: "/shop/computer", Icon: Monitor },
  { label: "Reading", blurb: "Light everyday eyeglasses for long reads", to: "/shop/eyeglasses", Icon: BookOpen },
  { label: "Driving", blurb: "Polarized sunglasses to cut glare", to: "/shop?feat=polarized", Icon: Car },
  { label: "Kids", blurb: "Flexible, lightweight frames for school", to: "/shop/kids", Icon: Smile },
];

export function ShopByUse() {
  return (
    <section aria-labelledby="use-title" className="bg-cream-200 py-10 md:py-16">
      <Container>
        <SectionHeading id="use-title" eyebrow="Made for your day" title="Shop by use" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {USES.map(({ label, blurb, to, Icon }) => (
            <li key={label}>
              <Link
                to={to}
                className="focus-ring flex h-full items-center gap-4 rounded-xl border border-ink-200 bg-cream-50 p-4 transition-colors duration-150 hover:border-ink-800"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink-900 text-gold-400">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-ink-900">{label}</span>
                  <span className="block text-sm text-ink-600">{blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
