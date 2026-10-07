import { NavLink, useLocation } from "react-router-dom";
import { FileText, Home, ShoppingBag } from "lucide-react";
import { useSettings } from "@/lib/settings.jsx";
import { waLink } from "@/lib/whatsapp.js";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon.jsx";
import { cn } from "@/lib/cn.js";

const itemClass = "focus-ring flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold";

const hiddenOn = (pathname) => pathname.startsWith("/admin") || pathname.startsWith("/p/") || pathname.startsWith("/quote") || pathname === "/links";

export function MobileBottomBar() {
  const { pathname } = useLocation();
  const { whatsappNumber } = useSettings();
  if (hiddenOn(pathname)) return null;
  const linkClass = ({ isActive }) => cn(itemClass, isActive ? "text-gold-400" : "text-cream-100");
  return (
    <nav aria-label="Quick navigation" className="on-dark fixed inset-x-0 bottom-0 z-40 flex border-t border-cream-100/15 bg-ink-900 md:hidden">
      <NavLink to="/" end className={linkClass}><Home className="h-5 w-5" aria-hidden="true" />Home</NavLink>
      <NavLink to="/shop" className={linkClass}><ShoppingBag className="h-5 w-5" aria-hidden="true" />Shop</NavLink>
      <NavLink to="/quote" className={linkClass}><FileText className="h-5 w-5" aria-hidden="true" />Quote</NavLink>
      {whatsappNumber ? (
        <a href={waLink(whatsappNumber, "Assalam o Alaikum! I have a question.")} target="_blank" rel="noopener noreferrer" className={cn(itemClass, "text-cream-100")}>
          <WhatsAppIcon className="h-5 w-5" />WhatsApp
        </a>
      ) : null}
    </nav>
  );
}
