import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_SETTINGS } from "@shared/settings-defaults.js";
import { getSettings } from "./api.js";
import { safeGet, safeSet } from "./storage.js";

const CACHE_KEY = "cg_settings";
const SettingsContext = createContext(DEFAULT_SETTINGS);

const mergeWithDefaults = (remote) => ({ ...DEFAULT_SETTINGS, ...(remote ?? {}) });

const isSettingsPayload = (payload) => Boolean(payload) && typeof payload === "object" && "businessName" in payload;

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => mergeWithDefaults(safeGet(CACHE_KEY, "session")));

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((payload) => {
        if (cancelled || !isSettingsPayload(payload)) return;
        safeSet(CACHE_KEY, payload, "session");
        setSettings(mergeWithDefaults(payload));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => settings, [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
