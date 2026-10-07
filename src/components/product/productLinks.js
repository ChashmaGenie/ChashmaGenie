import { waLink } from "@/lib/whatsapp.js";

export const pageUrl = (product) => `${window.location.origin}/p/${product.slug}`;

export const quoteLink = (product, colorKey, sizeIndex) => {
  if (product.category === "lenses") return `/quote?lens=${encodeURIComponent(product.slug)}`;
  const params = new URLSearchParams({ color: colorKey, size: String(sizeIndex) });
  return `/quote/${product.slug}?${params.toString()}`;
};

export const askLink = (settings, product) =>
  settings.whatsappNumber ? waLink(settings.whatsappNumber, `Assalam o Alaikum! I have a question about ${product.name}.\n${pageUrl(product)}`) : "";

export const notifyLink = (settings, product) => {
  const message = `Assalam o Alaikum! Please let me know when ${product.name} is back in stock.\n${pageUrl(product)}`;
  if (settings.whatsappNumber) return waLink(settings.whatsappNumber, message);
  const subject = encodeURIComponent(`Back in stock: ${product.name}`);
  return `mailto:${settings.businessEmail}?subject=${subject}&body=${encodeURIComponent(message)}`;
};
