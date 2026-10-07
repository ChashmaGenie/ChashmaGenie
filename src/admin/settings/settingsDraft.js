import { DEFAULT_SETTINGS } from "@shared/settings-defaults.js";
import { formatPkPhone, normalizePkPhone } from "@shared/rx.js";
import { makeId } from "@shared/schema.js";

export const MAX_LOOKBOOK = 12;

export const draftFromSettings = (settings) => {
  const merged = { ...DEFAULT_SETTINGS, ...(settings ?? {}) };
  return {
    ...merged,
    whatsappNumber: formatPkPhone(merged.whatsappNumber) || merged.whatsappNumber,
    freeShippingThreshold: String(merged.freeShippingThreshold ?? 0),
    lookbook: (merged.lookbook ?? []).map((entry) => ({ ...entry })),
  };
};

export const whatsappPreview = (input) => {
  const normalized = normalizePkPhone(input);
  return normalized ? `Customers will message +${normalized}` : "";
};

export const withLookbookEntryAdded = (lookbook, productSlug) =>
  lookbook.length >= MAX_LOOKBOOK || lookbook.some((entry) => entry.productSlug === productSlug)
    ? lookbook
    : [...lookbook, { id: makeId("lb"), productSlug, caption: "" }];

export const withLookbookCaption = (lookbook, id, caption) =>
  lookbook.map((entry) => (entry.id === id ? { ...entry, caption } : entry));

export const withoutLookbookEntry = (lookbook, id) => lookbook.filter((entry) => entry.id !== id);

export const withLookbookEntryMoved = (lookbook, index, offset) => {
  const target = index + offset;
  if (target < 0 || target >= lookbook.length) return lookbook;
  const reordered = [...lookbook];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  return reordered;
};
