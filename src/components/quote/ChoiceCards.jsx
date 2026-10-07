import { useId } from "react";
import { cn } from "@/lib/cn.js";

export function ChoiceGroup({ legend, hint, error, className, children }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <fieldset className={cn("min-w-0", className)} aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}>
      <legend className="mb-2 text-base font-semibold text-ink-900">{legend}</legend>
      {hint ? <p id={hintId} className="mb-3 text-sm text-ink-600">{hint}</p> : null}
      <div className="grid gap-3">{children}</div>
      {error ? <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-danger-600">{error}</p> : null}
    </fieldset>
  );
}

export function RadioCard({ name, value, checked, onChange, title, badge, children, type = "radio", disabled = false }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border bg-cream-50 p-4 transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sky-700",
        checked ? "border-ink-900 ring-1 ring-ink-900" : "border-ink-300 hover:bg-ink-100",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="mt-1 h-5 w-5 shrink-0 accent-teal-600"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 font-semibold text-ink-900">
          {title}
          {badge}
        </span>
        {children ? <span className="mt-1 block text-sm text-ink-600">{children}</span> : null}
      </span>
    </label>
  );
}
