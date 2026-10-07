import { HTTP, ROUTES } from "@functions/_lib/contract.js";
import { ApiError, fetchJson } from "@/lib/api.js";

const routes = ROUTES.admin;
const UPLOAD_TIMEOUT_MS = 45000;
const sessionExpiryListeners = new Set();

export const onSessionExpired = (listener) => {
  sessionExpiryListeners.add(listener);
  return () => sessionExpiryListeners.delete(listener);
};

const announceExpiry = () => sessionExpiryListeners.forEach((listener) => listener());

const isUnauthorized = (error) => error instanceof ApiError && error.status === HTTP.unauthorized;

const request = async (url, { keepSessionOnUnauthorized = false, ...options } = {}) => {
  try {
    return await fetchJson(url, { admin: true, ...options });
  } catch (error) {
    if (isUnauthorized(error) && !keepSessionOnUnauthorized) announceExpiry();
    throw error;
  }
};

const asList = (body, ...keys) => {
  if (Array.isArray(body)) return body;
  const key = keys.find((candidate) => Array.isArray(body?.[candidate]));
  return key ? body[key] : [];
};

const saveBlob = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

const downloadCsv = async (url, filename) => {
  const response = await fetch(url, { credentials: "same-origin" });
  if (response.status === HTTP.unauthorized) {
    announceExpiry();
    throw new ApiError({ status: response.status, code: "unauthorized", message: "Please log in again." });
  }
  if (!response.ok) throw new ApiError({ status: response.status, code: "http_error", message: "Could not download the file." });
  saveBlob(await response.blob(), filename);
};

const withoutHeaderRow = (csv) => csv.slice(csv.indexOf("\r\n") + 2);

const fetchCsvPages = async (url, offset = 0, pages = []) => {
  const response = await fetch(`${url}?offset=${offset}`, { credentials: "same-origin" });
  if (response.status === HTTP.unauthorized) {
    announceExpiry();
    throw new ApiError({ status: response.status, code: "unauthorized", message: "Please log in again." });
  }
  if (!response.ok) throw new ApiError({ status: response.status, code: "http_error", message: "Could not download the file." });
  const text = await response.text();
  const next = response.headers.get("X-Next-Offset");
  const gathered = [...pages, pages.length === 0 ? text : withoutHeaderRow(text)];
  return next ? fetchCsvPages(url, Number(next), gathered) : gathered;
};

const downloadPagedCsv = async (url, filename) => {
  const pages = await fetchCsvPages(url);
  saveBlob(new Blob(["\uFEFF", ...pages], { type: "text/csv;charset=utf-8" }), filename);
};

export const adminApi = {
  login: (password) =>
    request(routes.login, { method: "POST", body: { password }, keepSessionOnUnauthorized: true }),
  logout: () => request(routes.logout, { method: "POST", body: {}, keepSessionOnUnauthorized: true }),
  session: () => request(routes.session, { keepSessionOnUnauthorized: true }),

  catalog: async () => asList(await request(routes.catalog), "products"),
  createProduct: (product) => request(routes.products, { method: "POST", body: product }),
  updateProduct: (id, product) => request(routes.product(id), { method: "PUT", body: product }),
  patchProduct: (id, patch) => request(routes.product(id), { method: "PATCH", body: patch }),
  deleteProduct: (id) => request(routes.product(id), { method: "DELETE" }),
  duplicateProduct: (id) => request(routes.duplicateProduct(id), { method: "POST", body: {} }),
  deleteProducts: (ids) => request(routes.bulkDeleteProducts, { method: "POST", body: { ids } }),
  deleteSampleProducts: () => request(routes.bulkDeleteProducts, { method: "POST", body: { ids: "sample" } }),
  loadSampleCatalog: (force = false) => request(routes.seed, { method: "POST", body: { force } }),

  uploadImage: (blob) =>
    request(routes.images, {
      method: "POST",
      rawBody: blob,
      headers: { "Content-Type": blob.type },
      timeout: UPLOAD_TIMEOUT_MS,
    }),
  deleteImage: (id) => request(routes.image(id), { method: "DELETE" }),
  removeUnusedPhotos: () => request(routes.cleanupImages, { method: "POST", body: {} }),

  quotes: async (status) => asList(await request(routes.quotes(status)), "quotes"),
  quote: (id) => request(routes.quote(id)),
  patchQuote: (id, patch) => request(routes.quote(id), { method: "PATCH", body: patch }),
  deleteQuote: (id) => request(routes.quote(id), { method: "DELETE" }),
  downloadQuotesCsv: () => downloadPagedCsv(routes.quotesCsv, "chashmagenie-quotes.csv"),

  notifyList: async () => asList(await request(routes.notify), "entries", "list", "items", "notify"),
  downloadNotifyCsv: () => downloadCsv(routes.notifyCsv, "chashmagenie-notify-list.csv"),

  settings: () => request(routes.settings),
  saveSettings: (settings) => request(routes.settings, { method: "PUT", body: settings }),
};
