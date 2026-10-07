import { useId } from "react";
import { Switch } from "@/components/ui/Choice.jsx";
import { cn } from "@/lib/cn.js";

export function SwitchRow({ label, hint, checked, onChange, disabled, compact = false, className }) {
  const labelId = useId();
  return (
    <div className={cn("flex items-center justify-between gap-4", compact ? "min-h-[44px]" : "min-h-[56px] py-1", className)}>
      <div className="min-w-0">
        <p id={labelId} className="text-base font-medium text-ink-800">{label}</p>
        {hint ? <p className="text-sm text-ink-600">{hint}</p> : null}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} disabled={disabled} />
    </div>
  );
}
