import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/cn.js";

const ToastContext = createContext(null);
const AUTO_DISMISS_MS = 5000;

const withoutToast = (toasts, id) => toasts.filter((toast) => toast.id !== id);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((current) => withoutToast(current, id)), []);

  const show = useCallback(
    (message, tone = "success") => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current, { id, message, tone }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      show,
      success: (message) => show(message, "success"),
      error: (message) => show(message, "error"),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6" role="status" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = toast.tone === "error" ? AlertCircle : CheckCircle2;
          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl px-4 py-3 text-base shadow-sh-3 animate-fade-in",
                toast.tone === "error" ? "bg-danger-600 text-white" : "bg-ink-900 text-cream-100",
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="flex-1">{toast.message}</p>
              <button type="button" aria-label="Dismiss" onClick={() => dismiss(toast.id)} className="focus-ring -me-1 grid h-8 w-8 place-items-center rounded-full">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
};
