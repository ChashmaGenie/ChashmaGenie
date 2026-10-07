import { cn } from "@/lib/cn.js";

export function EmptyState({ icon: Icon, title, children, actions, className }) {
  return (
    <div className={cn("mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-12 text-center", className)}>
      {Icon ? (
        <span className="grid h-16 w-16 place-items-center rounded-full bg-cream-200 text-ink-800">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </span>
      ) : null}
      <h2 className="text-2xl">{title}</h2>
      {children ? <p className="text-ink-600">{children}</p> : null}
      {actions ? <div className="mt-2 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
