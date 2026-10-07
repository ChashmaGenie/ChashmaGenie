import { useEffect, useId, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn.js";

export function HelpTip({ label = "Help", children, className }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <span ref={rootRef} className={cn("relative inline-block align-middle", className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="focus-ring grid h-11 w-11 place-items-center rounded-full text-sky-700 hover:bg-ink-100"
      >
        <HelpCircle className="h-5 w-5" aria-hidden="true" />
      </button>
      <span
        id={panelId}
        role="note"
        hidden={!open}
        className="absolute start-0 top-full z-20 mt-1 block w-72 max-w-[80vw] rounded-xl border border-ink-200 bg-cream-50 p-3 text-start text-sm font-normal normal-case text-ink-800 shadow-sh-3"
      >
        {children}
      </span>
    </span>
  );
}
