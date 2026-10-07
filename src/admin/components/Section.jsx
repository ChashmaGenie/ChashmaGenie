import { cn } from "@/lib/cn.js";

export function Section({ id, title, description, children, className }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("rounded-xl border border-ink-200 bg-cream-50 p-4 md:p-6", className)}>
      <h2 id={`${id}-title`} className="text-2xl">{title}</h2>
      {description ? <p className="mt-1 text-base text-ink-600">{description}</p> : null}
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}
