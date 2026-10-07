import { cloneElement, useId } from "react";
import { cn } from "@/lib/cn.js";

export function Field({ label, hint, error, required, className, children }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-800">
        {label}
        {required ? <span className="text-danger-600" aria-hidden="true"> *</span> : null}
      </label>
      {cloneElement(children, { id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, required })}
      {hint ? <p id={hintId} className="text-sm text-ink-600">{hint}</p> : null}
      {error ? <p id={errorId} role="alert" className="text-sm font-medium text-danger-600">{error}</p> : null}
    </div>
  );
}
