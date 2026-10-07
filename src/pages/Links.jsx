import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, Mail, Sparkles, Store } from "lucide-react";
import { Seo } from "@/components/layout/Seo.jsx";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon.jsx";
import { useSettings } from "@/lib/settings.jsx";
import { waLink } from "@/lib/whatsapp.js";
import { withOutboundUtm, withUtm } from "@/lib/utm.js";
import { socialChannels } from "@/components/social/socialChannels.js";
import logo from "@/assets/logo.png";

const BIO_UTM = { source: "instagram", medium: "bio" };

const baseClasses =
  "focus-ring flex min-h-[56px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-start font-semibold transition-colors duration-150";
const primaryClasses = `${baseClasses} border-transparent bg-gold-400 text-ink-800 hover:bg-gold-500`;
const secondaryClasses = `${baseClasses} border-ink-300 bg-cream-50 text-ink-800 hover:border-ink-800`;

function InternalButton({ to, Icon, primary = false, children }) {
  return (
    <Link to={withUtm(to, BIO_UTM)} className={primary ? primaryClasses : secondaryClasses}>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="flex-1">{children}</span>
    </Link>
  );
}

function ExternalButton({ href, Icon, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={secondaryClasses}>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="flex-1">{children}</span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-600" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

const outboundSocials = (settings) =>
  socialChannels(settings, "bio").map((channel) => ({
    ...channel,
    href: withOutboundUtm(channel.href, { source: channel.key, medium: "bio" }),
  }));

const footerLinkClasses = "inline-flex min-h-[44px] items-center px-1 underline";

export default function Links() {
  const settings = useSettings();
  const socials = outboundSocials(settings);
  const whatsappHref = settings.whatsappNumber
    ? withOutboundUtm(waLink(settings.whatsappNumber, "Assalam o Alaikum! I found you through your links page."), BIO_UTM)
    : "";
  return (
    <div className="min-h-screen bg-cream-100">
      <Seo title={`${settings.businessName} links`} description={`Shop ${settings.businessName} frames, get a quote and follow us. ${settings.tagline}.`} path="/links" />
      <div className="mx-auto flex max-w-[480px] flex-col items-center gap-6 px-4 py-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <img src={logo} alt={settings.businessName} width="96" height="96" className="h-24 w-24 rounded-2xl" />
          <h1 className="text-3xl">{settings.businessName}</h1>
          <p className="font-display text-lg text-ink-600">{settings.tagline}</p>
          {settings.comingSoonEnabled ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3.5 py-1 text-sm font-semibold text-teal-700">
              <Store className="h-4 w-4" aria-hidden="true" />
              Online store &middot; physical store coming soon
            </p>
          ) : null}
        </header>
        <nav aria-label="Links" className="flex w-full flex-col gap-3">
          <InternalButton to="/shop?sort=newest" Icon={Sparkles} primary>Shop new arrivals</InternalButton>
          <InternalButton to="/shop" Icon={Store}>Shop all frames</InternalButton>
          <InternalButton to="/quote" Icon={FileText}>Get a quote</InternalButton>
          {whatsappHref ? <ExternalButton href={whatsappHref} Icon={WhatsAppIcon}>Chat on WhatsApp</ExternalButton> : null}
          {socials.map(({ key, label, Icon, href }) => (
            <ExternalButton key={key} href={href} Icon={Icon}>{label}</ExternalButton>
          ))}
          {settings.businessEmail ? (
            <a href={`mailto:${settings.businessEmail}`} className={secondaryClasses}>
              <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="flex-1">Email us</span>
            </a>
          ) : null}
        </nav>
        <footer className="text-center text-sm text-ink-600">
          <p className="flex flex-wrap items-center justify-center">
            <Link to="/shipping-returns" className={footerLinkClasses}>Shipping and returns</Link>
            {" · "}
            <Link to="/privacy" className={footerLinkClasses}>Privacy</Link>
            {" · "}
            <Link to="/" className={footerLinkClasses}>Visit the shop</Link>
          </p>
          <p className="mt-2">&copy; {new Date().getFullYear()} {settings.businessName}</p>
        </footer>
      </div>
    </div>
  );
}
