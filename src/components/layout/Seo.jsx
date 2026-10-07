import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "ChashmaGenie";
const DEFAULT_DESCRIPTION =
  "Shop eyeglasses, sunglasses and prescription lenses online in Pakistan. Pick your frame, add your prescription and get a quote from ChashmaGenie.";
const DEFAULT_IMAGE = "/og-default.png";
const JSON_LD_ATTRIBUTE = "data-seo-jsonld";

const upsertTag = (selector, tagName, attributes) => {
  const existing = document.head.querySelector(selector);
  const element = existing ?? document.createElement(tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  if (!existing) document.head.appendChild(element);
  return element;
};

const setMeta = (attribute, key, content) =>
  upsertTag(`meta[${attribute}="${key}"]`, "meta", { [attribute]: key, content });

const isRasterImage = (path) => !/\.svg(\?|$)/i.test(path);

const absolute = (path) => (path.startsWith("http") ? path : `${window.location.origin}${path}`);

const serializeJsonLd = (data) => JSON.stringify(data).replace(/</g, "\\u003c");

const formatTitle = (title, rawTitle) => {
  if (!title) return `${SITE_NAME} | See the World in Style`;
  return rawTitle ? title : `${title} | ${SITE_NAME}`;
};

export function Seo({ title, rawTitle = false, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE, path, noindex = false, type = "website", jsonLd }) {
  const { pathname } = useLocation();
  const canonicalPath = path ?? pathname;
  const fullTitle = formatTitle(title, rawTitle);
  const jsonLdText = jsonLd ? serializeJsonLd(jsonLd) : "";

  useEffect(() => {
    document.title = fullTitle;
    const url = absolute(canonicalPath);
    const imageUrl = absolute(isRasterImage(image) ? image : DEFAULT_IMAGE);
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("name", "twitter:card", "summary_large_image");
    upsertTag('link[rel="canonical"]', "link", { rel: "canonical", href: url });
  }, [fullTitle, description, image, canonicalPath, type]);

  useEffect(() => {
    if (!noindex) return undefined;
    const tag = upsertTag('meta[name="robots"]', "meta", { name: "robots", content: "noindex, nofollow" });
    return () => tag.remove();
  }, [noindex]);

  useEffect(() => {
    if (!jsonLdText) return undefined;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(JSON_LD_ATTRIBUTE, "");
    script.textContent = jsonLdText;
    document.head.appendChild(script);
    return () => script.remove();
  }, [jsonLdText]);

  return null;
}
