import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { captureAttribution } from "@/lib/utm.js";
import { trackPixel } from "@/lib/pixel.js";

export function RouteEffects({ mainRef }) {
  const { pathname, hash } = useLocation();
  const [announcement, setAnnouncement] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
    trackPixel("PageView");
    const timer = setTimeout(() => setAnnouncement(`Navigated to ${document.title}`), 150);
    return () => clearTimeout(timer);
  }, [pathname, hash, mainRef]);

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [pathname, hash]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}
