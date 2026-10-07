import {
  BADGES, CATEGORIES, COATINGS, COLORS, CONTACT_CHANNELS, FACE_SHAPES, FEATURES, GENDERS,
  LENS_INDEXES, LENS_TREATMENTS, LENS_TYPES, MATERIALS, RIM_TYPES, SHAPES, STOCK_STATUS,
  TINT_COLORS, USAGE, deriveSizeLabel, isOneOf, valuesOf,
} from "./enums.js";
import { DEFAULT_SETTINGS } from "./settings-defaults.js";
import { isValidEmail, normalizePkPhone, validateContact, validateRx } from "./rx.js";

const ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_ID_PATTERN = /^img_[a-z0-9]{8,16}$/;
const MAX_IMAGES = 8;
const MAX_LOOKBOOK = 12;
const MAX_QUOTE_ITEMS = 5;

const SOCIAL_HOSTS = {
  instagramUrl: ["instagram.com", "www.instagram.com"],
  facebookUrl: ["facebook.com", "www.facebook.com", "fb.com", "m.facebook.com"],
  tiktokUrl: ["tiktok.com", "www.tiktok.com"],
  youtubeUrl: ["youtube.com", "www.youtube.com", "youtu.be"],
};

const result = (errors, value) => ({ ok: Object.keys(errors).length === 0, errors, value });

const asText = (input, maxLength) => String(input ?? "").trim().slice(0, maxLength);

const asInteger = (input) => {
  if (input === "" || input === null || input === undefined) return NaN;
  const number = Number(input);
  return Number.isFinite(number) ? Math.round(number) : NaN;
};

const asList = (input) => (Array.isArray(input) ? input : []);

const uniqueAllowed = (input, allowedList) => {
  const allowed = valuesOf(allowedList);
  return [...new Set(asList(input))].filter((entry) => allowed.includes(entry));
};

const randomIndexes = (count) => {
  const bytes = new Uint8Array(count);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
};

export const makeId = (prefix = "p", length = 8) =>
  `${prefix}_${Array.from(randomIndexes(length), (byte) => ID_ALPHABET[byte % ID_ALPHABET.length]).join("")}`;

export const slugify = (text) =>
  String(text ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const normalizeSize = (size) => ({
  lens: asInteger(size?.lens),
  bridge: asInteger(size?.bridge),
  temple: asInteger(size?.temple),
});

const normalizeImageRef = (ref) => String(ref ?? "").trim();

const normalizeLens = (lens) => {
  if (!lens || typeof lens !== "object") return null;
  const rxRange = lens.rxRange && typeof lens.rxRange === "object"
    ? {
        sphMin: Number(lens.rxRange.sphMin),
        sphMax: Number(lens.rxRange.sphMax),
        cylMax: Number(lens.rxRange.cylMax),
        addMax: Number(lens.rxRange.addMax),
      }
    : undefined;
  return {
    lensType: lens.lensType,
    index: String(lens.index ?? ""),
    treatment: lens.treatment,
    coatings: uniqueAllowed(lens.coatings, COATINGS),
    ...(rxRange ? { rxRange } : {}),
    note: asText(lens.note, 300),
  };
};

const optionalEnum = (list, value) => (isOneOf(list, value) ? value : null);

const optionalPrice = (input) => {
  const price = asInteger(input);
  return Number.isNaN(price) ? undefined : price;
};

export const normalizeProduct = (input, now = new Date().toISOString()) => {
  const source = input ?? {};
  const isLens = source.category === "lenses";
  const sizes = isLens ? [] : asList(source.sizes).map(normalizeSize);
  const compareAtPrice = optionalPrice(source.compareAtPrice);
  const sku = asText(source.sku, 40);
  const descriptionUr = asText(source.descriptionUr, 1000);
  const lens = isLens ? normalizeLens(source.lens) : null;
  const name = asText(source.name, 80);
  return {
    id: asText(source.id, 20) || makeId("p"),
    slug: slugify(source.slug || name),
    name,
    brand: asText(source.brand, 60) || "ChashmaGenie",
    ...(sku ? { sku } : {}),
    category: source.category,
    gender: source.gender,
    shape: isLens ? null : optionalEnum(SHAPES, source.shape),
    rim: isLens ? null : optionalEnum(RIM_TYPES, source.rim),
    material: isLens ? null : optionalEnum(MATERIALS, source.material),
    colors: isLens ? [] : uniqueAllowed(source.colors, COLORS),
    sizes,
    sizeLabel: sizes.length ? deriveSizeLabel(sizes[0].lens) : null,
    faceShapes: uniqueAllowed(source.faceShapes, FACE_SHAPES),
    price: asInteger(source.price),
    ...(compareAtPrice !== undefined ? { compareAtPrice } : {}),
    rxCompatible: Boolean(source.rxCompatible),
    multifocalOk: Boolean(source.multifocalOk),
    badges: uniqueAllowed(source.badges, BADGES),
    stock: source.stock,
    featured: Boolean(source.featured),
    visible: source.visible !== false,
    sample: Boolean(source.sample),
    ...(source.slugFollowsName === true ? { slugFollowsName: true } : {}),
    images: asList(source.images).map(normalizeImageRef),
    description: asText(source.description, 1000),
    ...(descriptionUr ? { descriptionUr } : {}),
    features: uniqueAllowed(source.features, FEATURES),
    ...(lens ? { lens } : {}),
    createdAt: source.createdAt || now,
    updatedAt: now,
  };
};

const isValidImageRef = (ref) => IMAGE_ID_PATTERN.test(ref) || (ref.startsWith("/") && !ref.startsWith("//"));

const sizeErrors = (sizes) =>
  sizes.flatMap((size, index) => {
    const rules = [
      ["lens", 38, 62, "Lens width must be 38 to 62 mm."],
      ["bridge", 12, 24, "Bridge must be 12 to 24 mm."],
      ["temple", 120, 155, "Temple must be 120 to 155 mm."],
    ];
    return rules
      .filter(([key, min, max]) => !(size[key] >= min && size[key] <= max))
      .map(([key, , , message]) => [`sizes.${index}.${key}`, message]);
  });

const lensErrors = (lens) => {
  if (!lens) return [["lens", "Lens details are required for lenses."]];
  const checks = [
    ["lens.lensType", isOneOf(LENS_TYPES, lens.lensType), "Choose a lens type."],
    ["lens.index", isOneOf(LENS_INDEXES, lens.index), "Choose a lens index."],
    ["lens.treatment", isOneOf(LENS_TREATMENTS, lens.treatment), "Choose a treatment."],
  ];
  return checks.filter(([, valid]) => !valid).map(([path, , message]) => [path, message]);
};

const frameErrors = (product) => {
  const checks = [
    ["shape", product.shape, "Choose a shape."],
    ["rim", product.rim, "Choose a frame type."],
    ["material", product.material, "Choose a material."],
  ];
  const missing = checks.filter(([, value]) => !value).map(([path, , message]) => [path, message]);
  const colors = product.colors.length >= 1 && product.colors.length <= 6
    ? []
    : [["colors", "Choose 1 to 6 colours."]];
  const sizes = product.sizes.length >= 1 ? sizeErrors(product.sizes) : [["sizes", "Add at least one size."]];
  return [...missing, ...colors, ...sizes];
};

const commonProductErrors = (product) => {
  const checks = [
    ["name", product.name.length >= 2, "Please enter a name."],
    ["slug", product.name.length < 2 || SLUG_PATTERN.test(product.slug), "Web address name is invalid."],
    ["category", isOneOf(CATEGORIES, product.category), "Choose a type."],
    ["gender", isOneOf(GENDERS, product.gender), "Choose who it is for."],
    ["price", Number.isInteger(product.price) && product.price >= 0, "Enter a price in Rs."],
    [
      "compareAtPrice",
      product.compareAtPrice === undefined || product.compareAtPrice > product.price,
      "Old price must be higher than the price.",
    ],
    ["stock", isOneOf(STOCK_STATUS, product.stock), "Choose stock status."],
    [
      "images",
      product.images.length >= 1 && product.images.length <= MAX_IMAGES && product.images.every(isValidImageRef),
      `Add 1 to ${MAX_IMAGES} photos.`,
    ],
  ];
  return checks.filter(([, valid]) => !valid).map(([path, , message]) => [path, message]);
};

export const validateProduct = (input, now) => {
  const value = normalizeProduct(input, now);
  const categoryErrors = value.category === "lenses" ? lensErrors(value.lens) : frameErrors(value);
  const entries = [...commonProductErrors(value), ...(isOneOf(CATEGORIES, value.category) ? categoryErrors : [])];
  return result(Object.fromEntries(entries), value);
};

const UNSAFE_URL_CHARACTERS = /[\\\s]/;

const isAllowedSocialUrl = (key, url) => {
  if (UNSAFE_URL_CHARACTERS.test(url)) return false;
  try {
    const parsed = new URL(url);
    const hasCredentials = Boolean(parsed.username || parsed.password);
    const hostAllowed = SOCIAL_HOSTS[key].includes(parsed.hostname.toLowerCase());
    return parsed.protocol === "https:" && hostAllowed && !hasCredentials && !parsed.pathname.includes("//");
  } catch {
    return false;
  }
};

const normalizeLookbook = (input) =>
  asList(input)
    .slice(0, MAX_LOOKBOOK)
    .map((entry) => ({
      id: asText(entry?.id, 20) || makeId("lb"),
      productSlug: asText(entry?.productSlug, 80),
      caption: asText(entry?.caption, 80),
    }));

const TEXT_SETTINGS = [
  ["businessName", 60], ["tagline", 80], ["announcementText", 160], ["shippingText", 400],
  ["codText", 400], ["returnsText", 600], ["warrantyText", 600], ["cfAnalyticsToken", 64],
  ["businessEmail", 120],
];

const normalizeSettings = (input, now) => {
  const source = { ...DEFAULT_SETTINGS, ...(input ?? {}) };
  const texts = Object.fromEntries(TEXT_SETTINGS.map(([key, max]) => [key, asText(source[key], max)]));
  const socials = Object.fromEntries(Object.keys(SOCIAL_HOSTS).map((key) => [key, asText(source[key], 200)]));
  const whatsappDigits = String(source.whatsappNumber ?? "").trim();
  const freeShipping = asInteger(source.freeShippingThreshold);
  return {
    ...texts,
    ...socials,
    whatsappNumber: whatsappDigits ? normalizePkPhone(whatsappDigits) ?? whatsappDigits : "",
    comingSoonEnabled: Boolean(source.comingSoonEnabled),
    freeShippingThreshold: Number.isNaN(freeShipping) ? 0 : freeShipping,
    metaPixelId: asText(source.metaPixelId, 24),
    metaPixelEnabled: Boolean(source.metaPixelEnabled),
    lookbook: normalizeLookbook(source.lookbook),
    updatedAt: now,
  };
};

export const validateSettings = (input, now = new Date().toISOString()) => {
  const value = normalizeSettings(input, now);
  const entries = [];
  if (value.whatsappNumber && !normalizePkPhone(value.whatsappNumber)) {
    entries.push(["whatsappNumber", "Enter a valid Pakistani mobile number."]);
  }
  Object.keys(SOCIAL_HOSTS)
    .filter((key) => value[key] && !isAllowedSocialUrl(key, value[key]))
    .forEach((key) => entries.push([key, "Enter a full https link to the correct site."]));
  if (value.businessEmail && !isValidEmail(value.businessEmail)) {
    entries.push(["businessEmail", "That email does not look right."]);
  }
  if (value.freeShippingThreshold < 0) entries.push(["freeShippingThreshold", "Must be 0 or more."]);
  return result(Object.fromEntries(entries), value);
};

const normalizeAttribution = (attribution) => {
  const source = attribution ?? {};
  return Object.fromEntries(
    ["source", "medium", "campaign", "content", "referrer", "landing"].map((key) => [key, asText(source[key], 120)]),
  );
};

const normalizeQuoteItem = (item) => ({
  slug: asText(item?.slug, 80),
  colorKey: asText(item?.colorKey, 20),
  sizeIndex: Number.isInteger(item?.sizeIndex) ? item.sizeIndex : null,
  ownFrame: Boolean(item?.ownFrame),
  note: asText(item?.note, 200),
});

const quoteItemErrors = (items) => {
  if (items.length < 1 || items.length > MAX_QUOTE_ITEMS) return [["items", `Add 1 to ${MAX_QUOTE_ITEMS} frames.`]];
  return items
    .map((item, index) => [`items.${index}`, item])
    .filter(([, item]) => !item.ownFrame && !item.slug && !item.note)
    .map(([path]) => [path, "Choose a frame or describe it."]);
};

export const validateQuoteInput = (input) => {
  const source = input ?? {};
  const items = asList(source.items).map(normalizeQuoteItem);
  const rxMode = source.rx?.mode;
  const rxCheck = rxMode === "enter" ? validateRx(source.rx) : { ok: true, errors: {}, value: source.rx ?? null };
  const contactCheck = validateContact({ ...(source.contact ?? {}), consent: source.consent });
  const value = {
    items,
    usage: source.usage,
    lensPackageId: asText(source.lensPackageId, 20) || null,
    extras: uniqueAllowed(source.extras, COATINGS),
    tintColor: optionalEnum(TINT_COLORS, source.tintColor),
    rx: rxCheck.value ?? null,
    contact: { ...contactCheck.value, channel: optionalEnum(CONTACT_CHANNELS, source.contact?.channel) ?? "whatsapp" },
    consent: source.consent === true,
    attribution: normalizeAttribution(source.attribution),
    website: asText(source.website, 100),
  };
  const entries = [
    ...quoteItemErrors(items),
    ...(isOneOf(USAGE, value.usage) ? [] : [["usage", "Choose how you will use the glasses."]]),
    ...Object.entries(rxCheck.errors ?? {}).map(([path, message]) => [`rx.${path}`, message]),
    ...Object.entries(contactCheck.errors).map(([path, message]) => [path === "consent" ? "consent" : `contact.${path}`, message]),
  ];
  return result(Object.fromEntries(entries), value);
};

export const validateNotifyInput = (input) => {
  const raw = asText(input?.contact, 120);
  const phone = normalizePkPhone(raw);
  const isEmail = isValidEmail(raw);
  const errors = phone || isEmail ? {} : { contact: "Enter an email or a Pakistani mobile number." };
  const value = { contact: phone ?? raw.toLowerCase(), kind: phone ? "phone" : "email", website: asText(input?.website, 100) };
  return result(errors, value);
};
