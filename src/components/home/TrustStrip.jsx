import { Banknote, Glasses, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { useSettings } from "@/lib/settings.jsx";
import { Container } from "@/components/ui/Container.jsx";

const trustItems = (settings) =>
  [
    { key: "uv", title: "UV400 on every lens", body: "Lenses block harmful UV rays, clear or tinted.", Icon: ShieldCheck },
    { key: "made", title: "Lenses made to order", body: "Cut to your prescription and confirmed with you first.", Icon: Glasses },
    { key: "cod", title: "Cash on delivery", body: settings.codText, Icon: Banknote, hidden: !settings.codText },
    { key: "delivery", title: "Delivery across Pakistan", body: settings.shippingText, Icon: Truck, hidden: !settings.shippingText },
    {
      key: "support",
      title: "Support on WhatsApp",
      body: "Questions about fit or lenses? Message us.",
      Icon: MessageCircle,
      hidden: !settings.whatsappNumber,
    },
  ].filter((item) => !item.hidden);

export function TrustStrip() {
  const items = trustItems(useSettings());
  return (
    <section aria-label="Why shop with us" className="border-y border-ink-200 bg-cream-50 py-8">
      <Container>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map(({ key, title, body, Icon }) => (
            <li key={key} className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold text-ink-900">{title}</span>
                <span className="block text-sm text-ink-600">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
