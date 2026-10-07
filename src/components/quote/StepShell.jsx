import { forwardRef } from "react";

export const StepShell = forwardRef(function StepShell({ title, intro, children }, ref) {
  return (
    <section aria-labelledby="quote-step-title" className="flex flex-col gap-6">
      <header>
        <h2 id="quote-step-title" ref={ref} tabIndex={-1} className="text-2xl outline-none md:text-3xl">{title}</h2>
        {intro ? <p className="mt-2 text-ink-600">{intro}</p> : null}
      </header>
      {children}
    </section>
  );
});

export function InlineNotice({ tone = "info", children }) {
  const tones = {
    info: "border-ink-200 bg-cream-50 text-ink-800",
    warn: "border-warn-800/30 bg-warn-100 text-warn-800",
    error: "border-danger-600/30 bg-danger-100 text-danger-600",
  };
  return (
    <div role={tone === "error" ? "alert" : undefined} className={`rounded-xl border p-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}
