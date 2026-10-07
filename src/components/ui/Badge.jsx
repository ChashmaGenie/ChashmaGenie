import { cn } from "@/lib/cn.js";

const TONES = {
  gold: "bg-gold-400 text-ink-800",
  teal: "bg-teal-100 text-teal-700",
  ink: "bg-ink-900 text-cream-100",
  neutral: "bg-ink-100 text-ink-800",
  warn: "bg-warn-100 text-warn-800",
  danger: "bg-danger-100 text-danger-600",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span className={cn("label-caps inline-flex items-center rounded-full px-2.5 py-1", TONES[tone], className)}>
      {children}
    </span>
  );
}
