import { Link } from "react-router-dom";
import { Seo } from "@/components/layout/Seo.jsx";
import { PolicySection, StaticPage } from "@/components/home/StaticPage.jsx";
import { useHashScroll } from "@/components/home/useHashScroll.js";
import { useSettings } from "@/lib/settings.jsx";
import { formatPkr } from "@/lib/format.js";

const DEFAULT_RETURNS =
  "Ready frames and sunglasses can be reviewed for return or exchange if they arrive damaged or differ from your order. Prescription lenses are made specially for you, so we confirm every detail with you before we order them and cannot cancel once cutting has started. Your quote lists the terms for your order.";

const present = (text, fallback) => (text && text.trim() ? text.trim() : fallback);

export default function ShippingReturns() {
  const settings = useSettings();
  useHashScroll();
  return (
    <>
      <Seo title="Shipping and returns" description="Delivery, payment, returns and warranty information for ChashmaGenie orders in Pakistan." />
      <StaticPage title="Shipping and returns" intro="How your glasses reach you, how you pay, and what happens if something is not right.">
        <div className="flex flex-col gap-10">
          <PolicySection id="delivery" title="Delivery">
            <p>{present(settings.shippingText, "Delivery charges and time are confirmed with your quote.")}</p>
            {settings.freeShippingThreshold > 0 ? (
              <p>Delivery is free on orders above {formatPkr(settings.freeShippingThreshold)}.</p>
            ) : null}
            <p>Frames with prescription lenses are made to order. We share the expected time with your quote, before you confirm.</p>
          </PolicySection>
          <PolicySection id="cod" title="Payment">
            <p>{present(settings.codText, "We confirm the payment options with you when we confirm your quote.")}</p>
            <p>We never ask for payment before we have confirmed your frame, lenses and price with you.</p>
          </PolicySection>
          <PolicySection id="returns" title="Returns and exchanges">
            <p>{present(settings.returnsText, DEFAULT_RETURNS)}</p>
            <p>If anything arrives damaged or is not what you ordered, message us as soon as you receive it with a photo.</p>
          </PolicySection>
          {settings.warrantyText ? (
            <PolicySection id="warranty" title="Warranty">
              <p>{settings.warrantyText}</p>
            </PolicySection>
          ) : null}
          <PolicySection id="questions" title="Questions?">
            <p>
              See the <Link to="/faq">FAQ</Link> or <Link to="/contact">contact us</Link>. We are an online store and our physical store is coming soon.
            </p>
          </PolicySection>
        </div>
      </StaticPage>
    </>
  );
}
