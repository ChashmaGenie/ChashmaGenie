import { useId, useRef } from "react";
import { cn } from "@/lib/cn.js";

export function Tabs({ tabs, value, onChange, className, children }) {
  const baseId = useId();
  const listRef = useRef(null);
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.value === value));

  const moveFocus = (index) => {
    const next = (index + tabs.length) % tabs.length;
    onChange(tabs[next].value);
    listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") moveFocus(activeIndex + 1);
    if (event.key === "ArrowLeft") moveFocus(activeIndex - 1);
  };

  return (
    <div className={className}>
      <div ref={listRef} role="tablist" onKeyDown={handleKeyDown} className="scrollbar-none flex gap-1 overflow-x-auto border-b border-ink-200">
        {tabs.map((tab) => {
          const selected = tab.value === value;
          return (
            <button
              key={tab.value}
              id={`${baseId}-tab-${tab.value}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.value)}
              className={cn(
                "focus-ring min-h-[48px] shrink-0 border-b-2 px-4 text-base font-semibold transition-colors duration-150",
                selected ? "border-gold-500 text-ink-900" : "border-transparent text-ink-600 hover:text-ink-900",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${value}`} className="pt-4">
        {children}
      </div>
    </div>
  );
}
