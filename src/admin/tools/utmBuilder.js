import { slugify } from "@shared/schema.js";
import { CATEGORIES } from "@shared/enums.js";

export const PLATFORM_PRESETS = [
  { value: "instagram_bio", label: "Instagram bio", source: "instagram", medium: "bio" },
  { value: "instagram_story", label: "Instagram story", source: "instagram", medium: "story" },
  { value: "instagram_post", label: "Instagram post", source: "instagram", medium: "social" },
  { value: "facebook_post", label: "Facebook post", source: "facebook", medium: "social" },
  { value: "facebook_ad", label: "Facebook or Instagram ad", source: "facebook", medium: "paid_social" },
  { value: "whatsapp_status", label: "WhatsApp status", source: "whatsapp", medium: "status" },
  { value: "tiktok_bio", label: "TikTok bio", source: "tiktok", medium: "bio" },
  { value: "youtube", label: "YouTube description", source: "youtube", medium: "social" },
];

export const STATIC_PAGES = [
  { path: "/", label: "Home page" },
  { path: "/shop", label: "All glasses (Shop)" },
  { path: "/links", label: "Links page (for bios)" },
  { path: "/quote", label: "Get a quote" },
  ...CATEGORIES.map((category) => ({ path: `/shop/${category.value}`, label: `Shop: ${category.label}` })),
];

export const pageOptions = (products) => [
  ...STATIC_PAGES,
  ...products.filter((product) => product.visible !== false).map((product) => ({ path: `/p/${product.slug}`, label: `Product: ${product.name}` })),
];

export const buildTaggedUrl = ({ origin, path, preset, campaign }) => {
  if (!preset) return `${origin}${path}`;
  const params = new URLSearchParams({ utm_source: preset.source, utm_medium: preset.medium });
  const campaignName = slugify(campaign).replace(/-/g, "_");
  if (campaignName) params.set("utm_campaign", campaignName);
  return `${origin}${path}?${params.toString()}`;
};
