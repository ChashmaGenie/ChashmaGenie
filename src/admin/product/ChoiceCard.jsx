import { cn } from "@/lib/cn.js";

export function ChoiceCard({ type = "radio", name, value, checked, onChange, disabled = false, className, children }) {
  return (
    <label
      className={cn(
        "relative flex min-h-[56px] cursor-pointer items-center justify-center gap-2 rounded-xl border bg-cream-50 px-3 py-3 text-center text-base font-medium transition-colors duration-150",
        "border-ink-300 hover:bg-ink-100 has-[:checked]:border-ink-900 has-[:checked]:bg-cream-200 has-[:checked]:ring-2 has-[:checked]:ring-ink-900",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sky-700",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
      {children}
    </label>
  );
}
