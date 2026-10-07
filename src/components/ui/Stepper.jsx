import { Check } from "lucide-react";
import { cn } from "@/lib/cn.js";

export function Stepper({ steps, current, onSelect }) {
  const percent = Math.round(((current + 1) / steps.length) * 100);
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-600" aria-live="polite">
        Step {current + 1} of {steps.length}: {steps[current]}
      </p>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-ink-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <div className="h-full rounded-full bg-sky-500 transition-all duration-250" style={{ width: `${percent}%` }} />
      </div>
      <ol className="hidden items-center gap-2 md:flex">
        {steps.map((label, index) => {
          const done = index < current;
          const canSelect = done && onSelect;
          return (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canSelect}
                onClick={() => onSelect?.(index)}
                aria-current={index === current ? "step" : undefined}
                className={cn(
                  "focus-ring flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold",
                  index === current ? "bg-ink-900 text-cream-100" : done ? "text-teal-700" : "text-ink-600",
                )}
              >
                <span className={cn("grid h-6 w-6 place-items-center rounded-full text-xs", done ? "bg-teal-600 text-white" : "bg-ink-200 text-ink-800")}>
                  {done ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
