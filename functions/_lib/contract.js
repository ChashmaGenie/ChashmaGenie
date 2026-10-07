export const KV_KEYS = Object.freeze({
  catalog: "catalog:v1",
  settings: "settings:v1",
  sessionsRevokedBefore: "auth:revoked-before",
  imagePrefix: "img:",
  quotePrefix: "quote:",
  notifyPrefix: "notify:",
  image: (id) => `img:${id}`,
  quote: (id) => `quote:${id}`,
  notify: (contactHash) => `notify:${contactHash}`,
  loginAttempts: (ipHash) => `rl:login:${ipHash}`,
  quoteRate: (ipHash, bucket, slot) => `rl:q:${ipHash}:${bucket}:${slot}`,
  notifyRate: (ipHash, bucket, slot) => `rl:n:${ipHash}:${bucket}:${slot}`,
  quoteDailyTotal: (day) => `rl:day:q:${day}`,
  notifyDailyTotal: (day) => `rl:day:n:${day}`,
});

export const ROUTES = Object.freeze({
  catalog: "/api/catalog",
  settings: "/api/settings",
  image: (id) => `/api/img/${id}`,
  quotes: "/api/quotes",
  notify: "/api/notify",
  sitemap: "/sitemap.xml",
  robots: "/robots.txt",
  admin: {
    login: "/api/admin/login",
    logout: "/api/admin/logout",
    session: "/api/admin/session",
    catalog: "/api/admin/catalog",
    products: "/api/admin/products",
    product: (id) => `/api/admin/products/${id}`,
    duplicateProduct: (id) => `/api/admin/products/${id}/duplicate`,
    bulkDeleteProducts: "/api/admin/products/bulk-delete",
    seed: "/api/admin/seed",
    images: "/api/admin/images",
    image: (id) => `/api/admin/images/${id}`,
    cleanupImages: "/api/admin/images/cleanup",
    quotes: (status) => (status ? `/api/admin/quotes?status=${encodeURIComponent(status)}` : "/api/admin/quotes"),
    quote: (id) => `/api/admin/quotes/${id}`,
    quotesCsv: "/api/admin/quotes.csv",
    notify: "/api/admin/notify",
    notifyCsv: "/api/admin/notify.csv",
    settings: "/api/admin/settings",
  },
});

export const HTTP = Object.freeze({
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  payloadTooLarge: 413,
  unprocessable: 422,
  tooManyRequests: 429,
  notConfigured: 503,
});

export const ERROR_CODES = Object.freeze({
  invalidCredentials: "invalid_credentials",
  adminNotConfigured: "admin_not_configured",
  rateLimited: "rate_limited",
  unauthorized: "unauthorized",
  forbidden: "forbidden",
  notFound: "not_found",
  validation: "validation_failed",
  conflict: "conflict",
  payloadTooLarge: "payload_too_large",
  catalogTooLarge: "catalog_too_large",
  unsupportedMedia: "unsupported_media_type",
  imageInUse: "image_in_use",
  badRequest: "bad_request",
});

export const ERROR_STATUS = Object.freeze({
  [ERROR_CODES.invalidCredentials]: HTTP.unauthorized,
  [ERROR_CODES.adminNotConfigured]: HTTP.notConfigured,
  [ERROR_CODES.rateLimited]: HTTP.tooManyRequests,
  [ERROR_CODES.unauthorized]: HTTP.unauthorized,
  [ERROR_CODES.forbidden]: HTTP.forbidden,
  [ERROR_CODES.notFound]: HTTP.notFound,
  [ERROR_CODES.validation]: HTTP.unprocessable,
  [ERROR_CODES.conflict]: HTTP.conflict,
  [ERROR_CODES.payloadTooLarge]: HTTP.payloadTooLarge,
  [ERROR_CODES.catalogTooLarge]: HTTP.payloadTooLarge,
  [ERROR_CODES.unsupportedMedia]: HTTP.badRequest,
  [ERROR_CODES.imageInUse]: HTTP.conflict,
  [ERROR_CODES.badRequest]: HTTP.badRequest,
});

export const CACHE_CONTROL = Object.freeze({
  publicData: "public, max-age=60, s-maxage=120",
  image: "public, max-age=31536000, immutable",
  sitemap: "public, max-age=300, s-maxage=3600",
  robots: "public, max-age=86400",
  productPage: "public, max-age=0, s-maxage=60",
  noStore: "no-store",
});

export const LIMITS = Object.freeze({
  quoteBodyBytes: 16 * 1024,
  imageBytes: 600 * 1024,
  catalogBytes: 900 * 1024,
  quoteRatePerHour: 10,
  notifyRatePerHour: 10,
  quotesPerDay: 120,
  notifySignupsPerDay: 60,
  loginFailuresAllowed: 5,
  loginWindowSeconds: 900,
  loginFailureDelayMs: 300,
  quoteTtlSeconds: 15552000,
  notifyTtlSeconds: 31536000,
  quoteListMax: 5000,
  notifyListMax: 2000,
  rateKeyTtlSeconds: 7200,
  dailyKeyTtlSeconds: 172800,
  kvMetadataBytes: 1000,
  orphanPhotoMinAgeMs: 3600000,
  orphanPhotosPerRequest: 20,
  imageListMax: 2000,
});

export const SESSION = Object.freeze({
  cookieName: "cg_admin",
  maxAgeSeconds: 604800,
  csrfHeader: "X-Requested-With",
  csrfValue: "cg-admin",
  deviceCookieName: "cg_device",
  deviceMaxAgeSeconds: 7776000,
});

export const IMAGE_ID_PATTERN = /^img_[a-z0-9]{8,16}$/;
export const PRODUCT_ID_PATTERN = /^p_[a-z0-9]{8}$/;
export const QUOTE_ID_PATTERN = /^CG-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
export const ACCEPTED_IMAGE_TYPES = Object.freeze(["image/webp", "image/jpeg", "image/png"]);

export const errorBody = (code, message, fields) => ({
  error: code,
  message,
  ...(fields ? { fields } : {}),
});

export const catalogBody = (products, updatedAt) => ({ version: 1, updatedAt: updatedAt ?? null, products });

export const emptyCatalog = () => catalogBody([], null);

export const quoteCreatedBody = (quote) => ({ id: quote.id, createdAt: quote.createdAt });

export const imageUploadedBody = (id, bytes) => ({ id, url: ROUTES.image(id), bytes });

export const sessionBody = (expiresAt) => ({ authenticated: true, expiresAt });

const ITEM_SUMMARY_MAX_CHARS = 80;

const byteLength = (value) => new TextEncoder().encode(JSON.stringify(value)).byteLength;

export const quoteIndexEntry = (quote) => {
  const entry = {
    id: quote.id,
    createdAt: quote.createdAt,
    status: quote.status,
    name: quote.contact.name,
    phone: quote.contact.phone,
    city: quote.contact.city,
    itemSummary: quote.items.map((item) => item.productName).join(", ").slice(0, ITEM_SUMMARY_MAX_CHARS),
  };
  return byteLength(entry) <= LIMITS.kvMetadataBytes ? entry : { ...entry, itemSummary: "", city: entry.city.slice(0, 20) };
};

export const isNeverInitializedCatalog = (catalog) => catalog?.updatedAt == null;
