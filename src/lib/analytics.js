const BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";
const BEACON_ATTRIBUTE = "data-cf-beacon";

const hasBeacon = () => Boolean(document.querySelector(`script[${BEACON_ATTRIBUTE}]`));

export const loadCloudflareAnalytics = (token) => {
  if (!token || hasBeacon()) return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = BEACON_SRC;
  script.setAttribute(BEACON_ATTRIBUTE, JSON.stringify({ token }));
  document.head.appendChild(script);
};
