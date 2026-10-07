import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { adminApi } from "@/admin/api.js";
import { patchProduct, sampleProducts, upsertProduct, withoutProducts } from "./productList.js";

const CatalogContext = createContext(null);

export const CATALOG_STATUS = Object.freeze({ idle: "idle", loading: "loading", ready: "ready", error: "error" });

export function AdminCatalogProvider({ children }) {
  const [state, setState] = useState({ status: CATALOG_STATUS.idle, products: [], error: null });
  const inFlight = useRef(null);

  const load = useCallback(() => {
    if (inFlight.current) return inFlight.current;
    setState((current) => ({ ...current, status: CATALOG_STATUS.loading, error: null }));
    inFlight.current = adminApi
      .catalog()
      .then((products) => setState({ status: CATALOG_STATUS.ready, products, error: null }))
      .catch((error) => setState((current) => ({ ...current, status: CATALOG_STATUS.error, error })))
      .finally(() => {
        inFlight.current = null;
      });
    return inFlight.current;
  }, []);

  const ensureLoaded = useCallback(() => {
    if (state.status === CATALOG_STATUS.idle) load();
  }, [state.status, load]);

  const changeProducts = useCallback(
    (change) => setState((current) => ({ ...current, products: change(current.products) })),
    [],
  );

  const saveProduct = useCallback(
    async (draft, existingId) => {
      const saved = existingId ? await adminApi.updateProduct(existingId, draft) : await adminApi.createProduct(draft);
      changeProducts((products) => upsertProduct(products, saved));
      return saved;
    },
    [changeProducts],
  );

  const duplicateProduct = useCallback(
    async (id) => {
      const copy = await adminApi.duplicateProduct(id);
      changeProducts((products) => upsertProduct(products, copy));
      return copy;
    },
    [changeProducts],
  );

  const removeProduct = useCallback(
    async (id) => {
      await adminApi.deleteProduct(id);
      changeProducts((products) => withoutProducts(products, [id]));
    },
    [changeProducts],
  );

  const quickToggle = useCallback(
    async (product, patch) => {
      const previous = Object.fromEntries(Object.keys(patch).map((key) => [key, product[key]]));
      changeProducts((products) => patchProduct(products, product.id, patch));
      try {
        const saved = await adminApi.patchProduct(product.id, patch);
        if (saved?.id) changeProducts((products) => upsertProduct(products, saved));
      } catch (error) {
        changeProducts((products) => patchProduct(products, product.id, previous));
        throw error;
      }
    },
    [changeProducts],
  );

  const removeSamples = useCallback(async () => {
    const sampleIds = sampleProducts(state.products).map((product) => product.id);
    await adminApi.deleteSampleProducts();
    changeProducts((products) => withoutProducts(products, sampleIds));
  }, [state.products, changeProducts]);

  const loadSamples = useCallback(
    async (force = false) => {
      const result = await adminApi.loadSampleCatalog(force);
      await load();
      return result;
    },
    [load],
  );

  const value = useMemo(
    () => ({ ...state, load, ensureLoaded, saveProduct, duplicateProduct, removeProduct, quickToggle, removeSamples, loadSamples }),
    [state, load, ensureLoaded, saveProduct, duplicateProduct, removeProduct, quickToggle, removeSamples, loadSamples],
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export const useAdminCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useAdminCatalog must be used inside AdminCatalogProvider");
  return context;
};
