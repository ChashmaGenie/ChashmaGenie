import { ERROR_CODES, KV_KEYS, LIMITS, catalogBody, emptyCatalog, isNeverInitializedCatalog } from "./contract.js";
import { fail } from "./http.js";
import { withKeyLock } from "./keyed-lock.js";
import { DEFAULT_SETTINGS } from "../../shared/settings-defaults.js";
import { SEED_CATALOG } from "../../shared/seed-catalog.js";

const EDGE_READ_CACHE_SECONDS = 60;
const MIN_KV_TTL_SECONDS = 60;

export const readJson = (env, key, { cached = false } = {}) =>
  env.CHASHMA_KV.get(key, cached ? { type: "json", cacheTtl: EDGE_READ_CACHE_SECONDS } : { type: "json" });

export const writeJson = (env, key, value, options) => env.CHASHMA_KV.put(key, JSON.stringify(value), options);

export const removeKey = (env, key) => env.CHASHMA_KV.delete(key);

const normalizeCatalog = (stored) =>
  stored && Array.isArray(stored.products) ? catalogBody(stored.products, stored.updatedAt) : emptyCatalog();

export const loadCatalog = async (env, options) => normalizeCatalog(await readJson(env, KV_KEYS.catalog, options));

export const loadCatalogOrSamples = async (env, options) => {
  const catalog = await loadCatalog(env, options);
  const showSamples = isNeverInitializedCatalog(catalog) && catalog.products.length === 0;
  return showSamples ? catalogBody(SEED_CATALOG.products, null) : catalog;
};

export const saveCatalog = async (env, products, now = new Date().toISOString()) => {
  const catalog = catalogBody(products, now);
  const serialized = JSON.stringify(catalog);
  if (new TextEncoder().encode(serialized).byteLength > LIMITS.catalogBytes) {
    fail(ERROR_CODES.catalogTooLarge, "The catalog is too large. Remove some photos or products.");
  }
  await env.CHASHMA_KV.put(KV_KEYS.catalog, serialized);
  return catalog;
};

export const loadSettings = async (env, options) => ({
  ...DEFAULT_SETTINGS,
  ...((await readJson(env, KV_KEYS.settings, options)) ?? {}),
});

export const saveSettings = async (env, settings) => {
  await writeJson(env, KV_KEYS.settings, settings);
  return settings;
};

export const writeWithMetadata = (env, key, value, metadata, options = {}) =>
  env.CHASHMA_KV.put(key, JSON.stringify(value), { ...options, metadata });

export const listKeys = async (env, prefix, maxKeys) => {
  const collect = async (cursor, gathered) => {
    const page = await env.CHASHMA_KV.list({ prefix, cursor });
    const keys = [...gathered, ...page.keys].slice(0, maxKeys);
    return page.list_complete || keys.length >= maxKeys ? keys : collect(page.cursor, keys);
  };
  return collect(undefined, []);
};

export const listMetadata = async (env, prefix, maxKeys) =>
  (await listKeys(env, prefix, maxKeys)).map((key) => key.metadata).filter(Boolean);

export const modifyCatalog = (env, change, now = new Date().toISOString()) =>
  withKeyLock(KV_KEYS.catalog, async () => {
    const catalog = await loadCatalog(env);
    const { products, result } = change(catalog);
    if (products) await saveCatalog(env, products, now);
    return result;
  });

export const absoluteExpiration = (createdAt, ttlSeconds, nowMs = Date.now()) => {
  const wanted = Math.floor(new Date(createdAt).getTime() / 1000) + ttlSeconds;
  return Math.max(wanted, Math.floor(nowMs / 1000) + MIN_KV_TTL_SECONDS);
};
