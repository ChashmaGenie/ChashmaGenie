import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminApi } from "@/admin/api.js";

const QuotesContext = createContext(null);

const withEntryPatched = (entries, id, patch) => entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));

export function AdminQuotesProvider({ children }) {
  const [state, setState] = useState({ status: "loading", quotes: [], error: null });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: "loading", error: null }));
    try {
      const quotes = await adminApi.quotes();
      setState({ status: "ready", quotes, error: null });
    } catch (error) {
      setState((current) => ({ ...current, status: "error", error }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patchEntry = useCallback(
    (id, patch) => setState((current) => ({ ...current, quotes: withEntryPatched(current.quotes, id, patch) })),
    [],
  );

  const removeEntry = useCallback(
    (id) => setState((current) => ({ ...current, quotes: current.quotes.filter((entry) => entry.id !== id) })),
    [],
  );

  const newCount = useMemo(() => state.quotes.filter((entry) => entry.status === "new").length, [state.quotes]);

  const value = useMemo(() => ({ ...state, newCount, load, patchEntry, removeEntry }), [state, newCount, load, patchEntry, removeEntry]);
  return <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>;
}

export const useAdminQuotes = () => {
  const context = useContext(QuotesContext);
  if (!context) throw new Error("useAdminQuotes must be used inside AdminQuotesProvider");
  return context;
};
