import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";
import { focusField } from "./focusField.js";

export const ErrorSummary = forwardRef(function ErrorSummary({ errors }, ref) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="scroll-mt-[76px] rounded-xl border border-danger-600/40 bg-danger-100 p-4 outline-none">
      <p className="flex items-center gap-2 text-lg font-semibold text-danger-600">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
        Please fix {entries.length === 1 ? "this" : `these ${entries.length}`} before saving
      </p>
      <ul className="mt-2 space-y-1">
        {entries.map(([path, message]) => (
          <li key={path}>
            <button type="button" onClick={() => focusField(path)} className="focus-ring min-h-[44px] text-start text-base font-medium text-ink-900 underline">
              {message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});
