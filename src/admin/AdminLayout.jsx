import { Suspense } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { ExternalLink, Inbox, LogOut, Package, Settings, Wrench } from "lucide-react";
import logo from "@/assets/logo.png";
import { Seo } from "@/components/layout/Seo.jsx";
import { PageSkeleton } from "@/components/ui/Skeleton.jsx";
import { cn } from "@/lib/cn.js";
import { AdminSessionProvider, SESSION_STATUS, useAdminSession } from "@/admin/data/session.jsx";
import { AdminCatalogProvider } from "@/admin/data/AdminCatalog.jsx";
import { AdminQuotesProvider, useAdminQuotes } from "@/admin/data/AdminQuotes.jsx";

const LOGIN_PATH = "/admin";
const HOME_PATH = "/admin/products";

const NAV_ITEMS = [
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/quotes", label: "Quotes", icon: Inbox, showsNewCount: true },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/tools", label: "Tools", icon: Wrench },
];

function NewCountBadge() {
  const { newCount } = useAdminQuotes();
  if (!newCount) return null;
  return (
    <span className="absolute -end-3 -top-2 grid min-h-[20px] min-w-[20px] place-items-center rounded-full bg-gold-400 px-1.5 text-xs font-bold text-ink-800">
      {newCount}
      <span className="sr-only"> new</span>
    </span>
  );
}

function NavItem({ item, variant }) {
  const Icon = item.icon;
  const base = "focus-ring relative flex items-center font-semibold";
  const classes = ({ isActive }) =>
    variant === "tab"
      ? cn(base, "min-h-[60px] flex-1 flex-col justify-center gap-0.5 text-xs", isActive ? "text-gold-400" : "text-cream-100")
      : cn(base, "min-h-[48px] gap-3 rounded-[10px] px-4 text-base", isActive ? "bg-ink-900 text-cream-100" : "text-ink-800 hover:bg-ink-100");
  return (
    <NavLink to={item.to} className={classes}>
      <span className="relative">
        <Icon className="h-5 w-5" aria-hidden="true" />
        {item.showsNewCount ? <NewCountBadge /> : null}
      </span>
      {item.label}
    </NavLink>
  );
}

function TopBar({ onLogout }) {
  return (
    <header className="on-dark sticky top-0 z-40 flex min-h-[60px] items-center justify-between gap-3 bg-ink-900 px-4 text-cream-100">
      <NavLink to={HOME_PATH} className="focus-ring flex min-h-[44px] items-center gap-3 rounded-lg">
        <img src={logo} alt="" width="40" height="40" className="h-10 w-10 rounded-lg" />
        <span className="whitespace-nowrap font-display text-lg font-semibold text-gold-400">ChashmaGenie <span className="hidden text-cream-100 sm:inline">Admin</span></span>
      </NavLink>
      <div className="flex items-center gap-1">
        <a href="/" target="_blank" rel="noopener noreferrer" aria-label="View shop" className="focus-ring inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-3 text-sm font-semibold hover:bg-cream-100/10">
          <ExternalLink className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="hidden sm:inline">View shop</span>
        </a>
        <button type="button" onClick={onLogout} aria-label="Log out" className="focus-ring inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-3 text-sm font-semibold hover:bg-cream-100/10">
          <LogOut className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}

function AdminFrame() {
  const { logout } = useAdminSession();
  return (
    <AdminCatalogProvider>
      <AdminQuotesProvider>
        <TopBar onLogout={logout} />
        <div className="mx-auto flex w-full max-w-[1400px]">
          <nav aria-label="Admin sections" className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-56 shrink-0 flex-col gap-1 border-e border-ink-200 p-4 md:flex">
            {NAV_ITEMS.map((item) => <NavItem key={item.to} item={item} variant="rail" />)}
          </nav>
          <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 pb-28 pt-6 outline-none md:px-8 md:pb-10">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
        <nav aria-label="Admin sections" className="on-dark fixed inset-x-0 bottom-0 z-40 flex border-t border-cream-100/15 bg-ink-900 pb-[env(safe-area-inset-bottom)] md:hidden">
          {NAV_ITEMS.map((item) => <NavItem key={item.to} item={item} variant="tab" />)}
        </nav>
      </AdminQuotesProvider>
    </AdminCatalogProvider>
  );
}

function CheckingSession() {
  return (
    <div className="grid min-h-screen place-items-center" role="status">
      <img src={logo} alt="" width="64" height="64" className="h-16 w-16 animate-pulse rounded-xl" />
      <span className="sr-only">Checking your login</span>
    </div>
  );
}

function AdminGate() {
  const { status } = useAdminSession();
  const { pathname } = useLocation();
  const onLoginPage = pathname.replace(/\/$/, "") === LOGIN_PATH;

  if (status === SESSION_STATUS.checking) return <CheckingSession />;
  if (status === SESSION_STATUS.anonymous) {
    return onLoginPage ? <Suspense fallback={<PageSkeleton />}><Outlet /></Suspense> : <Navigate to={LOGIN_PATH} replace />;
  }
  if (onLoginPage) return <Navigate to={HOME_PATH} replace />;
  return <AdminFrame />;
}

export default function AdminLayout() {
  return (
    <>
      <Seo title="Admin" noindex />
      <AdminSessionProvider>
        <AdminGate />
      </AdminSessionProvider>
    </>
  );
}
