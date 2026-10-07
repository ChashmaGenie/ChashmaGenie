import { forwardRef } from "react";
import { cn } from "@/lib/cn.js";

export const controlClasses =
  "focus-ring w-full rounded-[10px] border border-ink-300 bg-cream-50 px-3.5 text-base text-ink-800 placeholder:text-ink-600/70 min-h-[48px] disabled:bg-ink-100 aria-[invalid=true]:border-danger-600";

export const Input = forwardRef(function Input({ className, type = "text", ...rest }, ref) {
  return <input ref={ref} type={type} className={cn(controlClasses, className)} {...rest} />;
});

export const Textarea = forwardRef(function Textarea({ className, rows = 4, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} className={cn(controlClasses, "py-3", className)} {...rest} />;
});

export const Select = forwardRef(function Select({ className, children, ...rest }, ref) {
  return (
    <select ref={ref} className={cn(controlClasses, "appearance-auto pe-8", className)} {...rest}>
      {children}
    </select>
  );
});
