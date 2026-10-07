import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/Toast.jsx";
import { adminApi, onSessionExpired } from "@/admin/api.js";

const SessionContext = createContext(null);

export const SESSION_STATUS = Object.freeze({
  checking: "checking",
  authenticated: "authenticated",
  anonymous: "anonymous",
});

export function AdminSessionProvider({ children }) {
  const [status, setStatus] = useState(SESSION_STATUS.checking);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    adminApi
      .session()
      .then(() => !cancelled && setStatus(SESSION_STATUS.authenticated))
      .catch(() => !cancelled && setStatus(SESSION_STATUS.anonymous));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () =>
      onSessionExpired(() => {
        setStatus((current) => {
          if (current === SESSION_STATUS.authenticated) toast.error("Please log in again.");
          return SESSION_STATUS.anonymous;
        });
        navigate("/admin", { replace: true });
      }),
    [navigate, toast],
  );

  const login = useCallback(async (password) => {
    await adminApi.login(password);
    setStatus(SESSION_STATUS.authenticated);
  }, []);

  const logout = useCallback(async () => {
    await adminApi.logout().catch(() => undefined);
    setStatus(SESSION_STATUS.anonymous);
    navigate("/admin", { replace: true });
  }, [navigate]);

  const value = useMemo(() => ({ status, login, logout }), [status, login, logout]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useAdminSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useAdminSession must be used inside AdminSessionProvider");
  return context;
};
