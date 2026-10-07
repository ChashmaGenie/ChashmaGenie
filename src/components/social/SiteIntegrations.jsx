import { useEffect } from "react";
import { useSettings } from "@/lib/settings.jsx";
import { loadCloudflareAnalytics } from "@/lib/analytics.js";
import { loadPixel } from "@/lib/pixel.js";
import { ConsentBanner } from "./ConsentBanner.jsx";

export function SiteIntegrations() {
  const { cfAnalyticsToken, metaPixelEnabled, metaPixelId } = useSettings();

  useEffect(() => {
    loadCloudflareAnalytics(cfAnalyticsToken);
  }, [cfAnalyticsToken]);

  useEffect(() => {
    if (metaPixelEnabled) loadPixel(metaPixelId);
  }, [metaPixelEnabled, metaPixelId]);

  return <ConsentBanner />;
}
