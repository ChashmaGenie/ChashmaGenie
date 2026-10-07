import { Suspense, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { MobileBottomBar } from "./MobileBottomBar.jsx";
import { FloatingWhatsApp } from "./FloatingWhatsApp.jsx";
import { RouteEffects } from "./RouteEffects.jsx";
import { SiteIntegrations } from "@/components/social/SiteIntegrations.jsx";
import { PageSkeleton } from "@/components/ui/Skeleton.jsx";

export function Layout({ chrome = true }) {
  const mainRef = useRef(null);
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <RouteEffects mainRef={mainRef} />
      {chrome ? <Header /> : null}
      <main id="main" ref={mainRef} tabIndex={-1} className="min-h-[calc(100svh-7rem)] outline-none">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      {chrome ? <Footer /> : null}
      {chrome ? <MobileBottomBar /> : null}
      {chrome ? <FloatingWhatsApp /> : null}
      <SiteIntegrations />
    </>
  );
}
