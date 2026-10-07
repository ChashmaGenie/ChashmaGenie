import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, Music2, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";
import { useSettings } from "@/lib/settings.jsx";
import { waLink } from "@/lib/whatsapp.js";
import { withOutboundUtm } from "@/lib/utm.js";
import { postNotify } from "@/lib/api.js";
import { resetConsent } from "@/lib/pixel.js";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { PRIMARY_NAV } from "./navData.js";

const SUPPORT_LINKS = [
  { label: "Get a quote", to: "/quote" },
  { label: "FAQ", to: "/faq" },
  { label: "Shipping and returns", to: "/shipping-returns" },
  { label: "Contact", to: "/contact" },
];

const COMPANY_LINKS = [
  { label: "About us", to: "/about" },
  { label: "Privacy", to: "/privacy" },
  { label: "Follow links", to: "/links" },
];

const socialEntries = (settings) =>
  [
    { key: "instagram", label: "Instagram", Icon: Instagram, href: settings.instagramUrl },
    { key: "facebook", label: "Facebook", Icon: Facebook, href: settings.facebookUrl },
    { key: "tiktok", label: "TikTok", Icon: Music2, href: settings.tiktokUrl },
    { key: "youtube", label: "YouTube", Icon: Youtube, href: settings.youtubeUrl },
  ]
    .filter((entry) => entry.href)
    .map((entry) => ({ ...entry, href: withOutboundUtm(entry.href, { source: "website", medium: "footer" }) }));

const whatsappEntry = (number) => (number ? [{ key: "whatsapp", label: "WhatsApp", Icon: WhatsAppIcon, href: waLink(number) }] : []);

function LinkColumn({ title, links }) {
  return (
    <nav aria-label={title}>
      <h2 className="label-caps mb-3 font-sans text-gold-400">{title}</h2>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="focus-ring inline-flex min-h-[44px] items-center rounded text-cream-100/90 hover:text-gold-400">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NotifyForm() {
  const toast = useToast();
  const [contact, setContact] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await postNotify({ contact, website: honeypot });
      setContact("");
      toast.success("Thank you. We will tell you when the store opens.");
    } catch (error) {
      toast.error(error.fields?.contact ?? "Please enter a valid email or mobile number.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label htmlFor="footer-notify" className="text-sm text-cream-100/90">Store opening soon. Tell us where to reach you.</label>
      <div className="flex gap-2">
        <Input id="footer-notify" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Email or mobile number" required autoComplete="email" />
        <input type="text" name="website" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 opacity-0" />
        <Button type="submit" loading={busy} size="sm">Notify me</Button>
      </div>
    </form>
  );
}

export function Footer() {
  const settings = useSettings();
  const socials = [...whatsappEntry(settings.whatsappNumber), ...socialEntries(settings)];
  return (
    <footer className="on-dark mt-16 bg-ink-900 pb-24 text-cream-100 md:pb-0">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <img src={logo} alt="ChashmaGenie" width="64" height="64" className="h-16 w-16 rounded-xl" />
          <p className="font-display text-xl text-gold-400">{settings.tagline}</p>
          <p className="text-sm text-cream-100/80">Online store. Our physical store is coming soon.</p>
          <ul className="flex flex-wrap gap-2">
            {socials.map(({ key, label, Icon, href }) => (
              <li key={key}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-cream-100/30 hover:border-gold-400 hover:text-gold-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              </li>
            ))}
            {settings.businessEmail ? (
              <li>
                <a href={`mailto:${settings.businessEmail}`} aria-label="Email us" className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-cream-100/30 hover:border-gold-400 hover:text-gold-400">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </a>
              </li>
            ) : null}
          </ul>
        </div>
        <LinkColumn title="Shop" links={[{ label: "All glasses", to: "/shop" }, ...PRIMARY_NAV]} />
        <LinkColumn title="Help" links={SUPPORT_LINKS} />
        <LinkColumn title="Company" links={COMPANY_LINKS} />
        <NotifyForm />
      </div>
      <div className="border-t border-cream-100/15">
        <p className="container-page py-4 text-sm text-cream-100/70">
          &copy; {new Date().getFullYear()} {settings.businessName}. Quotes are estimates, not medical advice.
          {settings.metaPixelEnabled && settings.metaPixelId ? (
            <>
              {" "}
              <button type="button" onClick={resetConsent} className="focus-ring inline-flex min-h-[44px] items-center underline">Cookie settings</button>
            </>
          ) : null}
        </p>
      </div>
    </footer>
  );
}
