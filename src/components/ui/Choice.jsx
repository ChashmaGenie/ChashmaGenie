import { forwardRef } from "react";
import { cn } from "@/lib/cn.js";

const choiceBase = "focus-ring h-5 w-5 shrink-0 border-ink-300 accent-teal-600";

export const Checkbox = forwardRef(function Checkbox({ label, hint, className, id, ...rest }, ref) {
  return (
    <label className={cn("flex min-h-[44px] cursor-pointer items-start gap-3 py-2", className)}>
      <input ref={ref} id={id} type="checkbox" className={cn(choiceBase, "mt-0.5 rounded")} {...rest} />
      <span className="text-base text-ink-800">
        {label}
        {hint ? <span className="block text-sm text-ink-600">{hint}</span> : null}
      </span>
    </label>
  );
});

export const Radio = forwardRef(function Radio({ label, hint, className, ...rest }, ref) {
  return (
    <label className={cn("flex min-h-[44px] cursor-pointer items-start gap-3 py-2", className)}>
      <input ref={ref} type="radio" className={cn(choiceBase, "mt-0.5 rounded-full")} {...rest} />
      <span className="text-base text-ink-800">
        {label}
        {hint ? <span className="block text-sm text-ink-600">{hint}</span> : null}
      </span>
    </label>
  );
});

export function Switch({ checked, onChange, label, disabled, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("focus-ring inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-full disabled:opacity-50", className)}
    >
      <span className={cn("relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-150", checked ? "bg-teal-600" : "bg-ink-300")}>
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-sh-1 transition-transform duration-150",
            checked ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1",
          )}
        />
      </span>
    </button>
  );
}
