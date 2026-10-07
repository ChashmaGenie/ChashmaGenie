import { Link } from "react-router-dom";
import { Drawer } from "@/components/ui/Modal.jsx";
import { useSettings } from "@/lib/settings.jsx";
import { waLink } from "@/lib/whatsapp.js";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon.jsx";
import { MORE_LINKS, PRIMARY_NAV, SHOP_BY_SHAPE, SHOP_BY_USE } from "./navData.js";

function NavGroup({ title, links, onClose }) {
  return (
    <section className="mb-5">
      <h3 className="label-caps mb-1 text-ink-600">{title}</h3>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} onClick={onClose} className="focus-ring flex min-h-[44px] items-center rounded text-base font-medium text-ink-900">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MobileNav({ open, onClose }) {
  const { whatsappNumber } = useSettings();
  return (
    <Drawer open={open} onClose={onClose} title="Menu" className="lg:hidden">
      <NavGroup title="Shop" links={[{ label: "All glasses", to: "/shop" }, ...PRIMARY_NAV]} onClose={onClose} />
      <NavGroup title="By use" links={SHOP_BY_USE} onClose={onClose} />
      <NavGroup title="By shape" links={SHOP_BY_SHAPE} onClose={onClose} />
      <NavGroup title="More" links={[{ label: "Get a quote", to: "/quote" }, ...MORE_LINKS]} onClose={onClose} />
      {whatsappNumber ? (
        <a href={waLink(whatsappNumber, "Assalam o Alaikum! I have a question.")} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex min-h-[48px] items-center gap-2 rounded-[10px] bg-gold-400 px-5 font-semibold text-ink-800">
          <WhatsAppIcon /> Chat on WhatsApp
        </a>
      ) : null}
    </Drawer>
  );
}
