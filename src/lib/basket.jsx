import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { safeGet, safeSet } from "./storage.js";

const STORAGE_KEY = "cg_basket";
export const MAX_BASKET_ITEMS = 5;
const BasketContext = createContext(null);

const isBasketItem = (item) => item && typeof item.slug === "string";

const loadItems = () => {
  const stored = safeGet(STORAGE_KEY);
  return Array.isArray(stored) ? stored.filter(isBasketItem).slice(0, MAX_BASKET_ITEMS) : [];
};

const normalizeItem = ({ slug, colorKey = null, sizeIndex = 0 }) => ({ slug, colorKey, sizeIndex });

const withItem = (items, candidate) => {
  const item = normalizeItem(candidate);
  const others = items.filter((existing) => existing.slug !== item.slug);
  return [...others, item].slice(-MAX_BASKET_ITEMS);
};

export function BasketProvider({ children }) {
  const [items, setItems] = useState(loadItems);

  useEffect(() => {
    safeSet(STORAGE_KEY, items);
  }, [items]);

  const add = useCallback((item) => setItems((current) => withItem(current, item)), []);
  const remove = useCallback((slug) => setItems((current) => current.filter((item) => item.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isFull: items.length >= MAX_BASKET_ITEMS,
      has: (slug) => items.some((item) => item.slug === slug),
      add,
      remove,
      clear,
    }),
    [items, add, remove, clear],
  );
  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) throw new Error("useBasket must be used inside BasketProvider");
  return context;
};
