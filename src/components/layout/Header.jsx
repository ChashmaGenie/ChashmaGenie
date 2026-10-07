import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Heart, Menu, Search, ShoppingBag } from "lucide-react";
import logo from "@/assets/logo.png";
import { useSettings } from "@/lib/settings.jsx";
import { useWishlist } from "@/lib/wishlist.jsx";
import { useBasket } from "@/lib/basket.jsx";
import { waLink } from "@/lib/whatsapp.js";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon.jsx";
import { IconButton } from "@/components/ui/Button.jsx";
import { AnnouncementBar } from "./AnnouncementBar.jsx";
import { SearchBox } from "./SearchBox.jsx";
import { MobileNav } from "./MobileNav.jsx";
import { PRIMARY_NAV, SHOP_BY_SHAPE, SHOP_BY_USE } from "./navData.js";

const navLinkClass = ({ isActive }) =>
  `focus-ring flex min-h-[44px] items-center rounded-[10px] px-3 text-sm font-semibold ${isActive ? "text-gold-400" : "text-cream-100 hover:text-gold-400"}`;

function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -end-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-gold-400 px-1 text-xs font-bold text-ink-800">
      {count}
    </span>
  );
}

function MegaMenu() {
  return (
    <div className="group relative">
      <button type="button" className="focus-ring flex min-h-[44px] items-center gap-1 rounded-[10px] px-3 text-sm font-semibold text-cream-100 hover:text-gold-400" aria-haspopup="true">
        Shop <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="invisible absolute start-0 top-full z-50 w-[560px] pt-2 opacity-0 transition-opacity duration-150 focus-within:visible focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="grid grid-cols-3 gap-6 rounded-xl border border-ink-200 bg-cream-50 p-6 text-ink-800 shadow-sh-3">
          <MegaColumn title="By type" links={PRIMARY_NAV} />
          <MegaColumn title="By use" links={SHOP_BY_USE} />
          <MegaColumn title="By shape" links={SHOP_BY_SHAPE} />
        </div>
      </div>
    </div>
  );
}

function MegaColumn({ title, links }) {
  return (
    <div>
      <p className="label-caps mb-2 text-ink-600">{title}</p>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="focus-ring block rounded py-1.5 text-sm font-medium hover:text-teal-600">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Header() {
  const { whatsappNumber } = useSettings();
  const wishlist = useWishlist();
  const basket = useBasket();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40">
      <div className="on-dark bg-ink-900 text-cream-100">
        <div className="container-page flex h-16 items-center gap-3 lg:h-[72px] lg:gap-6">
          <IconButton label="Open menu" variant="onDark" onClick={() => setMenuOpen(true)} className="lg:hidden">
            <Menu className="h-6 w-6" aria-hidden="true" />
          </IconButton>
          <Link to="/" className="focus-ring flex shrink-0 items-center gap-2 rounded-[10px]" aria-label="ChashmaGenie home">
            <img src={logo} alt="" width="48" height="48" className="h-11 w-11 rounded-lg lg:h-12 lg:w-12" />
            <span className="hidden font-display text-xl font-bold text-gold-400 sm:inline">ChashmaGenie</span>
          </Link>
          <nav aria-label="Main" className="hidden items-center lg:flex">
            <MegaMenu />
            {PRIMARY_NAV.slice(0, 3).map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>{link.label}</NavLink>
            ))}
          </nav>
          <SearchBox className="ms-auto hidden max-w-sm flex-1 text-ink-800 lg:block" />
          <div className="ms-auto flex items-center gap-1 lg:ms-0">
            <IconButton label="Search" variant="onDark" onClick={() => setSearchOpen((open) => !open)} className="lg:hidden" aria-expanded={searchOpen}>
              <Search className="h-6 w-6" aria-hidden="true" />
            </IconButton>
            <Link to="/wishlist" aria-label={`Wishlist, ${wishlist.count} saved`} className="focus-ring relative grid h-11 w-11 place-items-center rounded-[10px] hover:bg-white/10">
              <Heart className="h-6 w-6" aria-hidden="true" />
              <CountBadge count={wishlist.count} />
            </Link>
            <Link to="/quote" aria-label={`Quote basket, ${basket.count} items`} className="focus-ring relative grid h-11 w-11 place-items-center rounded-[10px] hover:bg-white/10">
              <ShoppingBag className="h-6 w-6" aria-hidden="true" />
              <CountBadge count={basket.count} />
            </Link>
            {whatsappNumber ? (
              <a href={waLink(whatsappNumber, "Assalam o Alaikum! I have a question.")} target="_blank" rel="noopener noreferrer" className="focus-ring ms-2 hidden min-h-[44px] items-center gap-2 rounded-[10px] bg-gold-400 px-4 text-sm font-semibold text-ink-800 hover:bg-gold-500 xl:inline-flex">
                <WhatsAppIcon /> WhatsApp
              </a>
            ) : null}
          </div>
        </div>
        {searchOpen ? (
          <div className="container-page pb-3 text-ink-800 lg:hidden">
            <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
          </div>
        ) : null}
      </div>
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      </header>
    </>
  );
}
