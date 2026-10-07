import { Info } from "lucide-react";

export const DISCLAIMER_TEXT =
  "Quotes are estimates for convenience only and are not medical advice, an eye examination, or a prescription. We do not diagnose, treat or prescribe. Please enter the prescription exactly as written by your licensed optometrist or ophthalmologist. We may contact you to verify your details, and the final price, lens suitability and availability will be confirmed by the shop owner before any order is made. Lenses with high powers, prisms, or large differences between eyes may need special ordering. If you experience discomfort, headaches, sudden vision changes or eye pain, stop using the glasses and consult an eye-care professional. Eye examinations are recommended every 1-2 years. Blue-light filtering and other coatings are comfort features and are not a treatment for any eye condition.";

export const CONSENT_LABEL =
  "I confirm that the prescription I provided comes from a licensed eye-care professional and I understand this is a quote request, not medical advice.";

export function Disclaimer() {
  return (
    <aside aria-label="Important information" className="flex gap-3 rounded-xl border border-ink-200 bg-cream-50 p-4">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
      <p className="text-sm text-ink-600">{DISCLAIMER_TEXT}</p>
    </aside>
  );
}
