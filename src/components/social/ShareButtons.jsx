import { Check, Facebook, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { withOutboundUtm } from "@/lib/utm.js";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon.jsx";
import { useToast } from "@/components/ui/Toast.jsx";

const shareUrl = (url, source) => withOutboundUtm(url, { source, medium: "share" });

const buttonClasses =
  "focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-ink-300 bg-cream-50 px-4 text-sm font-semibold text-ink-800 transition-colors duration-150 hover:bg-ink-100";

const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export function ShareButtons({ title, url = window.location.href, className }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url: shareUrl(url, "native") });
    } catch {
      return;
    }
  };

  const copyLink = async () => {
    const done = await copyToClipboard(shareUrl(url, "copy"));
    if (!done) return toast.error("Could not copy the link. Please copy it from the address bar.");
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl(url, "whatsapp")}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl(url, "facebook"))}`;

  return (
    <div className={className} role="group" aria-label="Share this product">
      <ul className="flex flex-wrap gap-2">
        {canNativeShare() ? (
          <li>
            <button type="button" onClick={nativeShare} className={buttonClasses}>
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </button>
          </li>
        ) : (
          <>
            <li>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClasses}>
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </li>
            <li>
              <a href={facebookHref} target="_blank" rel="noopener noreferrer" className={buttonClasses}>
                <Facebook className="h-4 w-4" aria-hidden="true" />
                Facebook
              </a>
            </li>
          </>
        )}
        <li>
          <button type="button" onClick={copyLink} className={buttonClasses}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
            Copy link
          </button>
        </li>
      </ul>
    </div>
  );
}
