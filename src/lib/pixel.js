import { safeGet, safeRemove, safeSet } from "./storage.js";

const CONSENT_KEY = "cg_consent";
const PIXEL_SCRIPT = "https://connect.facebook.net/en_US/fbevents.js";
const ALLOWED_EVENTS = ["PageView", "ViewContent", "AddToWishlist", "Lead", "Contact"];

export const getConsent = () => safeGet(CONSENT_KEY);

export const setConsent = (choice) => safeSet(CONSENT_KEY, choice);

export const CONSENT_RESET_EVENT = "cg:consent-reset";

export const resetConsent = () => {
  safeRemove(CONSENT_KEY);
  if (typeof window.fbq === "function") window.fbq("consent", "revoke");
  window.dispatchEvent(new Event(CONSENT_RESET_EVENT));
};

export const hasPixelConsent = () => getConsent() === "accepted";

const hasPixelLoaded = () => typeof window.fbq === "function";

const installQueue = () => {
  const queue = function queuedFbq(...args) {
    queue.callMethod ? queue.callMethod(...args) : queue.queue.push(args);
  };
  queue.push = queue;
  queue.loaded = true;
  queue.version = "2.0";
  queue.queue = [];
  window.fbq = queue;
  window._fbq = queue;
};

const injectScript = () => {
  const script = document.createElement("script");
  script.async = true;
  script.src = PIXEL_SCRIPT;
  document.head.appendChild(script);
};

export const loadPixel = (pixelId) => {
  if (!pixelId || !hasPixelConsent() || hasPixelLoaded()) return;
  installQueue();
  injectScript();
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
};

export const trackPixel = (eventName, data = {}) => {
  if (!ALLOWED_EVENTS.includes(eventName)) return;
  if (!hasPixelConsent() || !hasPixelLoaded()) return;
  window.fbq("track", eventName, data);
};
