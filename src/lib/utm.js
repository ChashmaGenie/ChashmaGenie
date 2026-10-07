import { safeGet, safeSet } from "./storage.js";

const STORAGE_KEY = "cg_attr";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const UTM_FIELDS = ["source", "medium", "campaign", "content", "term"];

const referrerHost = () => {
  try {
    const host = new URL(document.referrer).hostname;
    return host === window.location.hostname ? "" : host;
  } catch {
    return "";
  }
};

const readUtmParams = (search) => {
  const params = new URLSearchParams(search);
  return Object.fromEntries(UTM_FIELDS.map((field) => [field, params.get(`utm_${field}`) ?? ""]));
};

const isFresh = (stored) => stored && typeof stored.expiresAt === "number" && stored.expiresAt > Date.now();

const buildFirstTouch = () => ({
  ...readUtmParams(window.location.search),
  referrer: referrerHost(),
  landing: window.location.pathname,
});

export const captureAttribution = () => {
  if (isFresh(safeGet(STORAGE_KEY))) return;
  safeSet(STORAGE_KEY, { ...buildFirstTouch(), expiresAt: Date.now() + THIRTY_DAYS_MS });
};

export const getAttribution = () => {
  const stored = safeGet(STORAGE_KEY);
  const base = isFresh(stored) ? stored : buildFirstTouch();
  return {
    source: base.source || (base.referrer ? "referral" : "direct"),
    medium: base.medium || (base.referrer ? "referral" : "none"),
    campaign: base.campaign || "",
    content: base.content || "",
    referrer: base.referrer || "",
    landing: base.landing || "/",
  };
};

export const withUtm = (path, { source, medium, campaign }) => {
  const url = new URL(path, "https://placeholder.local");
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  if (campaign) url.searchParams.set("utm_campaign", campaign);
  return `${url.pathname}${url.search}${url.hash}`;
};

export const withOutboundUtm = (href, { source, medium, campaign }) => {
  try {
    const url = new URL(href);
    url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", medium);
    if (campaign) url.searchParams.set("utm_campaign", campaign);
    return url.toString();
  } catch {
    return href;
  }
};
