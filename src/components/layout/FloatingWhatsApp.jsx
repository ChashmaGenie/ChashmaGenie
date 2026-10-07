import { useLocation } from "react-router-dom";
import { useSettings } from "@/lib/settings.jsx";
import { waLink } from "@/lib/whatsapp.js";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon.jsx";

const HIDDEN_PREFIXES = ["/p/", "/quote"];

export function FloatingWhatsApp() {
  const { whatsappNumber } = useSettings();
  const { pathname } = useLocation();
  if (!whatsappNumber || HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;
  return (
    <a
      href={waLink(whatsappNumber, "Assalam o Alaikum! I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="focus-ring fixed bottom-20 end-4 z-30 hidden h-14 w-14 place-items-center rounded-full bg-teal-600 text-white shadow-sh-3 hover:bg-teal-700 md:grid"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
