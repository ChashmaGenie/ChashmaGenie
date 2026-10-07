import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn.js";

export function AccordionItem({ title, defaultOpen = false, open: controlledOpen, onToggle, count, className, children }) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const panelId = useId();
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const toggle = () => (isControlled ? onToggle?.(!open) : setInternalOpen(!open));
  return (
    <div className={cn("border-b border-ink-200", className)}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
          className="focus-ring flex min-h-[48px] w-full items-center justify-between gap-3 py-3 text-start text-base font-semibold text-ink-900"
        >
          <span>
            {title}
            {count ? <span className="ms-2 text-sm font-medium text-ink-600">({count})</span> : null}
          </span>
          <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform duration-150", open && "rotate-180")} aria-hidden="true" />
        </button>
      </h3>
      <div id={panelId} role="region" hidden={!open} className="pb-4">
        {children}
      </div>
    </div>
  );
}

export const Accordion = ({ className, children }) => <div className={cn("border-t border-ink-200", className)}>{children}</div>;
