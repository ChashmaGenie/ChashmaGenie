import { Button } from "@/components/ui/Button.jsx";

export function SaveBar({ dirty, saving, disabled = false, onSave, onCancel, saveLabel = "Save" }) {
  return (
    <div className="sticky bottom-16 z-30 -mx-4 mt-6 border-t border-ink-200 bg-cream-50/95 px-4 py-3 backdrop-blur md:bottom-0 md:mx-0 md:rounded-t-xl">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-600" aria-live="polite">
          {dirty ? (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-gold-500" aria-hidden="true" />
              Unsaved changes
            </>
          ) : (
            "No changes yet"
          )}
        </p>
        <div className="flex gap-2">
          {onCancel ? <Button variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button> : null}
          <Button onClick={onSave} loading={saving} disabled={disabled}>{saveLabel}</Button>
        </div>
      </div>
    </div>
  );
}
