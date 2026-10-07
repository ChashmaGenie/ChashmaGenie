import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Mail } from "lucide-react";
import { QUOTE_ID_PATTERN } from "@functions/_lib/contract.js";
import { Button, WhatsAppIcon } from "@/components/ui/index.js";
import { Seo } from "@/components/layout/Seo.jsx";
import { useSettings } from "@/lib/settings.jsx";
import { waLink } from "@/lib/whatsapp.js";
import { buildMailto, buildQuoteMessage } from "@/components/quote/quoteMessage.js";

const NEXT_STEPS = [
  ["We check your details", "The owner reviews your frame, lenses and prescription."],
  ["You get your quote", "We contact you on your preferred channel with a price and delivery time."],
  ["You approve, then we order", "Nothing is ordered or charged until you say yes."],
];

const GENERIC_MESSAGE = (ref) => `Assalam o Alaikum! I sent a quote request.\nRef: ${ref}`;

const hasMatchingSummary = (summary, id) => Boolean(summary) && summary.ref === id;

function WhatsAppActions({ summary, id, whatsappNumber, businessEmail }) {
  const message = hasMatchingSummary(summary, id) ? buildQuoteMessage(summary) : GENERIC_MESSAGE(id);
  const mailto = hasMatchingSummary(summary, id)
    ? buildMailto(summary, businessEmail)
    : `mailto:${businessEmail}?subject=${encodeURIComponent(`Quote request ${id}`)}&body=${encodeURIComponent(message)}`;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {whatsappNumber ? (
        <Button href={waLink(whatsappNumber, message)} target="_blank" rel="noopener noreferrer" variant="teal" size="lg">
          <WhatsAppIcon className="h-6 w-6" />
          Send on WhatsApp
        </Button>
      ) : null}
      <Button href={mailto} variant={whatsappNumber ? "secondary" : "primary"} size="lg">
        <Mail className="h-6 w-6" aria-hidden="true" />
        Email instead
      </Button>
    </div>
  );
}

export default function QuoteDone() {
  const { id } = useParams();
  const { state } = useLocation();
  const { whatsappNumber, businessEmail } = useSettings();
  const summary = state?.summary ?? null;
  const validId = QUOTE_ID_PATTERN.test(id);
  const firstName = hasMatchingSummary(summary, id) ? summary.name.split(" ")[0] : "";

  return (
    <div className="container-page section-y">
      <Seo title="Quote request received" noindex />
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex flex-col items-start gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-teal-100 text-teal-700">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="text-3xl md:text-4xl">{firstName ? `Thank you, ${firstName}!` : "We received your request"}</h1>
          {validId ? (
            <p className="text-lg text-ink-600">
              Your reference is <strong className="tabular rounded-md bg-cream-200 px-2 py-0.5 font-mono text-ink-900">{id}</strong>. Keep it handy when you talk to us.
            </p>
          ) : (
            <p className="text-lg text-ink-600">We could not read that reference, but if you just sent a request it has reached us.</p>
          )}
        </header>

        <section aria-labelledby="next-heading" className="rounded-xl border border-ink-200 bg-cream-50 p-5">
          <h2 id="next-heading" className="text-2xl">What happens next</h2>
          <ol className="mt-4 grid gap-4">
            {NEXT_STEPS.map(([title, detail], index) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-900 text-sm font-semibold text-cream-100">{index + 1}</span>
                <span>
                  <span className="block font-semibold text-ink-900">{title}</span>
                  <span className="block text-ink-600">{detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {validId ? (
          <section aria-labelledby="speed-heading" className="flex flex-col gap-3">
            <h2 id="speed-heading" className="text-2xl">Want a faster reply?</h2>
            <p className="text-ink-600">
              Message us with your reference.{whatsappNumber ? " After the chat opens you can also attach a photo of your prescription." : ""}
            </p>
            <WhatsAppActions summary={summary} id={id} whatsappNumber={whatsappNumber} businessEmail={businessEmail} />
          </section>
        ) : null}

        <p className="text-sm text-ink-600">
          Quotes are estimates and not medical advice. See our <Link to="/privacy" className="text-sky-700 underline">privacy note</Link> and <Link to="/faq" className="text-sky-700 underline">FAQ</Link>.
        </p>
        <Button to="/shop" variant="secondary" className="self-start">Continue shopping</Button>
      </div>
    </div>
  );
}
