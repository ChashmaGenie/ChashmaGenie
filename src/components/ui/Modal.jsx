import { useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn.js";
import { IconButton } from "./Button.jsx";
import { useOverlay } from "./overlay.js";

const PLACEMENTS = {
  modal: "items-center justify-center p-4",
  sheet: "items-end justify-center",
  drawer: "items-stretch justify-end",
};

const PANELS = {
  modal: "w-full max-w-lg max-h-[90vh] rounded-xl animate-fade-in",
  sheet: "w-full max-h-[92vh] rounded-t-2xl animate-sheet-up",
  drawer: "h-full w-full max-w-md animate-fade-in",
};

function Overlay({ placement, open, onClose, title, footer, className, children }) {
  const titleId = useId();
  const panelRef = useOverlay({ open, onClose });
  if (!open) return null;
  return createPortal(
    <div className={cn("fixed inset-0 z-[80] flex", PLACEMENTS[placement])}>
      <div className="absolute inset-0 bg-ink-900/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn("relative flex flex-col bg-cream-50 shadow-sh-3", PANELS[placement], className)}
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-5 py-3">
          <h2 id={titleId} className="text-xl">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-ink-200 px-5 py-3">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export const Modal = (props) => <Overlay placement="modal" {...props} />;

export const BottomSheet = (props) => <Overlay placement="sheet" {...props} />;

export const Drawer = (props) => <Overlay placement="drawer" {...props} />;
