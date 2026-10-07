import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { friendlyError } from "@/admin/errors.js";

export function LoadError({ error, onRetry, what = "this page" }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-danger-600/30 bg-danger-100 px-5 py-8 text-center">
      <AlertCircle className="h-8 w-8 text-danger-600" aria-hidden="true" />
      <p className="text-lg font-semibold text-ink-900">Could not load {what}</p>
      <p className="text-base text-ink-800">{friendlyError(error)}</p>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  );
}
