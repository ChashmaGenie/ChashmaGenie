import { useState } from "react";
import { X } from "lucide-react";
import { useSettings } from "@/lib/settings.jsx";
import { safeGet, safeSet } from "@/lib/storage.js";

const DISMISS_KEY = "cg_announcement_dismissed";

export function AnnouncementBar() {
  const { comingSoonEnabled, announcementText } = useSettings();
  const [dismissed, setDismissed] = useState(() => safeGet(DISMISS_KEY, "session") === true);

  if (!comingSoonEnabled || !announcementText || dismissed) return null;

  const dismiss = () => {
    safeSet(DISMISS_KEY, true, "session");
    setDismissed(true);
  };

  return (
    <div className="on-dark bg-gold-400 text-ink-800">
      <div className="container-page flex min-h-[40px] items-center justify-between gap-3 py-2 text-sm font-medium">
        <p className="flex-1 text-center">{announcementText}</p>
        <button type="button" aria-label="Dismiss announcement" onClick={dismiss} className="focus-ring -my-2 grid h-11 w-11 shrink-0 place-items-center rounded-full">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
