import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SHAPES } from "@shared/enums.js";
import { SEED_CATALOG } from "@shared/seed-catalog.js";
import { isNeverInitializedCatalog } from "@functions/_lib/contract.js";
import { getCatalog } from "./api.js";
import { safeGet, safeSet } from "./storage.js";

const CACHE_KEY = "cg_catalog";
const CatalogContext = createContext(null);

const isCatalogPayload = (payload) => Boolean(payload) && Array.isArray(payload.products);

const resolveCatalog = (payload) =>
  isNeverInitializedCatalog(payload) && payload.products.length === 0
    ? { products: SEED_CATALOG.products, status: "fallback" }
    : { products: payload.products, status: "ready" };

const initialState = () => {
  const cached = safeGet(CACHE_KEY, "session");
  return isCatalogPayload(cached) ? resolveCatalog(cached) : { products: [], status: "loading" };
};

const loadCatalog = async () => {
  try {
    const payload = await getCatalog();
    if (!isCatalogPayload(payload)) throw new Error("invalid catalog");
    safeSet(CACHE_KEY, payload, "session");
    return resolveCatalog(payload);
  } catch {
    return { products: SEED_CATALOG.products, status: "fallback" };
  }
};

export function CatalogProvider({ children }) {
  const [state, setState] = useState(initialState);

  const refresh = useCallback(() => loadCatalog().then(setState), []);

  useEffect(() => {
    let cancelled = false;
    loadCatalog().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const bySlugMap = new Map(state.products.map((product) => [product.slug, product]));
    return {
      products: state.products,
      status: state.status,
      bySlug: (slug) => bySlugMap.get(slug) ?? null,
      refresh,
    };
  }, [state, refresh]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used inside CatalogProvider");
  return context;
};

const isFrame = (product) => product.category !== "lenses";

export const SHAPE_TILES = SHAPES.map(({ value, label }) => ({ value, label, to: `/shop?shape=${value}` }));

export const useFeatured = (limit = 8) => {
  const { products, status } = useCatalog();
  return useMemo(() => {
    const frames = products.filter(isFrame);
    const featured = frames.filter((product) => product.featured);
    const rest = frames.filter((product) => !product.featured);
    return { products: [...featured, ...rest].slice(0, limit), status };
  }, [products, status, limit]);
};

export const useByShape = () => {
  const { products } = useCatalog();
  return useMemo(
    () =>
      SHAPE_TILES.map((tile) => ({
        ...tile,
        count: products.filter((product) => product.shape === tile.value).length,
      })),
    [products],
  );
};
