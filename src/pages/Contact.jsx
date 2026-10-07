import { useState } from "react";
import { Mail } from "lucide-react";
import { Seo } from "@/components/layout/Seo.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { Field } from "@/components/ui/Field.jsx";
import { Input, Textarea } from "@/components/ui/Input.jsx";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon.jsx";
import { FollowCards } from "@/components/social/FollowCards.jsx";
import { useSettings } from "@/lib/settings.jsx";
import { trackPixel } from "@/lib/pixel.js";
import { waLink } from "@/lib/whatsapp.js";

const composeMessage = ({ name, message }) => [`Assalam o Alaikum! My name is ${name.trim()}.`, message.trim()].join("\n");

const mailtoLink = (email, { name, message }) => {
  const subject = encodeURIComponent(`Question from ${name.trim()}`);
  return `mailto:${email}?subject=${subject}&body=${encodeURIComponent(message.trim())}`;
};

const validate = ({ name, message }) => ({
  ...(name.trim() ? {} : { name: "Please tell us your name." }),
  ...(message.trim() ? {} : { message: "Please write your message." }),
});

function ContactForm({ whatsappNumber, email }) {
  const [form, setForm] = useState({ name: "", message: "" });
  const [errors, setErrors] = useState({});
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const send = (open) => (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length === 0) open();
  };

  const openWhatsApp = () => {
    trackPixel("Contact");
    window.open(waLink(whatsappNumber, composeMessage(form)), "_blank", "noopener,noreferrer");
  };

  const openEmail = () => {
    window.location.href = mailtoLink(email, form);
  };

  return (
    <form noValidate className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-cream-50 p-5 md:p-6">
      <h2 className="text-2xl">Send us a message</h2>
      <Field label="Your name" error={errors.name} required>
        <Input value={form.name} onChange={update("name")} autoComplete="name" />
      </Field>
      <Field label="Your message" error={errors.message} hint="Your message opens in WhatsApp or your email app. Nothing is stored on this site." required>
        <Textarea value={form.message} onChange={update("message")} rows={5} />
      </Field>
      <div className="flex flex-wrap gap-3">
        {whatsappNumber ? (
          <Button type="submit" variant="teal" onClick={send(openWhatsApp)}>
            <WhatsAppIcon className="h-5 w-5" />
            Send on WhatsApp
          </Button>
        ) : null}
        {email ? (
          <Button type="submit" variant={whatsappNumber ? "secondary" : "primary"} onClick={send(openEmail)}>
            <Mail className="h-5 w-5" aria-hidden="true" />
            Send by email
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function DirectChannels({ whatsappNumber, email }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {whatsappNumber ? (
        <li>
          <a
            href={waLink(whatsappNumber, "Assalam o Alaikum! I have a question.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackPixel("Contact")}
            className="focus-ring flex items-center gap-4 rounded-xl border border-ink-200 bg-cream-50 p-4 hover:border-ink-800"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-600 text-white">
              <WhatsAppIcon className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-semibold text-ink-900">WhatsApp</span>
              <span className="block text-sm text-ink-600">The fastest way to reach us</span>
            </span>
          </a>
        </li>
      ) : null}
      {email ? (
        <li>
          <a href={`mailto:${email}`} className="focus-ring flex items-center gap-4 rounded-xl border border-ink-200 bg-cream-50 p-4 hover:border-ink-800">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink-900 text-gold-400">
              <Mail className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold text-ink-900">Email</span>
              <span className="block break-all text-sm text-ink-600">{email}</span>
            </span>
          </a>
        </li>
      ) : null}
    </ul>
  );
}

export default function Contact() {
  const { whatsappNumber, businessEmail } = useSettings();
  const hasMessageChannel = Boolean(whatsappNumber || businessEmail);
  return (
    <Container className="py-10 md:py-16">
      <Seo title="Contact us" description="Reach ChashmaGenie on WhatsApp, email, Instagram or Facebook. We are an online store and our physical store is coming soon." />
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl">Contact us</h1>
        <p className="mt-4 text-lg text-ink-600">
          We are an online store, so the best way to reach us is a message. Our physical store is coming soon.
        </p>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-6">
          <DirectChannels whatsappNumber={whatsappNumber} email={businessEmail} />
          <div>
            <h2 className="mb-3 text-2xl">Follow along</h2>
            <FollowCards medium="contact" className="grid gap-3" />
          </div>
        </div>
        {hasMessageChannel ? <ContactForm whatsappNumber={whatsappNumber} email={businessEmail} /> : null}
      </div>
    </Container>
  );
}
