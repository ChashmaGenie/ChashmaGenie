import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "@/lib/settings.jsx";
import { CONSENT_RESET_EVENT, getConsent, loadPixel, setConsent } from "@/lib/pixel.js";
import { Button } from "@/components/ui/Button.jsx";

export function ConsentBanner() {
  const { metaPixelEnabled, metaPixelId } = useSettings();
  const [choice, setChoice] = useState(getConsent);

  useEffect(() => {
    const syncChoice = () => setChoice(getConsent());
    window.addEventListener(CONSENT_RESET_EVENT, syncChoice);
    return () => window.removeEventListener(CONSENT_RESET_EVENT, syncChoice);
  }, []);

  if (!metaPixelEnabled || !metaPixelId || choice) return null;

  const decide = (value) => {
    setConsent(value);
    setChoice(value);
    if (value === "accepted") loadPixel(metaPixelId);
  };

  return (
    <section
      aria-label="Cookie preferences"
      className="on-dark fixed inset-x-3 bottom-20 z-40 mx-auto max-w-xl rounded-xl bg-ink-900 p-4 text-cream-100 shadow-sh-3 md:bottom-4"
    >
      <p className="text-sm">
        We use a Meta Pixel to measure how our Instagram and Facebook visitors browse the shop. It never sees your prescription or contact details.{" "}
        <Link to="/privacy#analytics" className="underline">Read more</Link>
      </p>
      <div className="mt-3 flex gap-3">
        <Button size="sm" onClick={() => decide("accepted")}>Accept</Button>
        <Button size="sm" variant="ghost" className="border-cream-100/40 !text-cream-100 hover:!bg-ink-800" onClick={() => decide("declined")}>
          Decline
        </Button>
      </div>
    </section>
  );
}
