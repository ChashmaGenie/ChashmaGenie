import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { safeGet, safeSet } from "./storage.js";

const STORAGE_KEY = "cg_wishlist";
const WishlistContext = createContext(null);

const loadSlugs = () => {
  const stored = safeGet(STORAGE_KEY);
  return Array.isArray(stored) ? stored.filter((slug) => typeof slug === "string") : [];
};

const toggled = (slugs, slug) => (slugs.includes(slug) ? slugs.filter((entry) => entry !== slug) : [...slugs, slug]);

export function WishlistProvider({ children }) {
  const [slugs, setSlugs] = useState(loadSlugs);

  useEffect(() => {
    safeSet(STORAGE_KEY, slugs);
  }, [slugs]);

  const toggle = useCallback((slug) => setSlugs((current) => toggled(current, slug)), []);
  const remove = useCallback((slug) => setSlugs((current) => current.filter((entry) => entry !== slug)), []);

  const value = useMemo(
    () => ({ slugs, count: slugs.length, has: (slug) => slugs.includes(slug), toggle, remove }),
    [slugs, toggle, remove],
  );
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
};
