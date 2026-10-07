import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/cn.js";

const itemClasses = "focus-ring flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-start text-base font-medium hover:bg-ink-100";

export function RowMenu({ label, items }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
    const closeOnEscape = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const choose = (item) => {
    setOpen(false);
    item.onSelect?.();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className="focus-ring grid h-11 w-11 place-items-center rounded-full hover:bg-ink-100"
      >
        <MoreVertical className="h-5 w-5" aria-hidden="true" />
      </button>
      <ul id={menuId} hidden={!open} className="absolute end-0 top-full z-30 mt-1 w-48 rounded-xl border border-ink-200 bg-cream-50 p-1 shadow-sh-3">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </>
          );
          return (
            <li key={item.label}>
              {item.to ? (
                <Link to={item.to} className={itemClasses} onClick={() => setOpen(false)}>{content}</Link>
              ) : (
                <button type="button" className={cn(itemClasses, item.danger && "text-danger-600")} onClick={() => choose(item)}>{content}</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
