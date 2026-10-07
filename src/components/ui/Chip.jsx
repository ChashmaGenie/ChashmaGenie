import { X } from "lucide-react";
import { cn } from "@/lib/cn.js";

export function Chip({ selected = false, onClick, onRemove, disabled, className, children, ...rest }) {
  const classes = cn(
    "focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-150",
    selected ? "border-ink-900 bg-ink-900 text-cream-100" : "border-ink-300 bg-cream-50 text-ink-800 hover:bg-ink-100",
    disabled && "cursor-not-allowed opacity-50",
    className,
  );
  if (!onClick) {
    return (
      <span className={classes} {...rest}>
        {children}
        {onRemove ? (
          <button type="button" aria-label="Remove" onClick={onRemove} className="focus-ring -me-2 grid h-8 w-8 place-items-center rounded-full">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </span>
    );
  }
  return (
    <button type="button" aria-pressed={selected} disabled={disabled} onClick={onClick} className={classes} {...rest}>
      {children}
    </button>
  );
}
