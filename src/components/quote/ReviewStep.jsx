import { forwardRef } from "react";
import { Mail } from "lucide-react";
import { Button, WhatsAppIcon } from "@/components/ui/index.js";
import { Disclaimer } from "./Disclaimer.jsx";
import { InlineNotice, StepShell } from "./StepShell.jsx";
import { EstimateBox, SelectionList } from "./Summary.jsx";

function SubmitProblem({ problem, fallback }) {
  if (!problem) return null;
  return (
    <div className="flex flex-col gap-3">
      <InlineNotice tone="error">{problem.message}</InlineNotice>
      {problem.offerFallback ? (
        <div className="flex flex-wrap gap-3">
          {fallback.whatsappHref ? (
            <Button href={fallback.whatsappHref} target="_blank" rel="noopener noreferrer" variant="teal">
              <WhatsAppIcon className="h-5 w-5" />
              Send on WhatsApp instead
            </Button>
          ) : null}
          <Button href={fallback.mailtoHref} variant="secondary">
            <Mail className="h-5 w-5" aria-hidden="true" />
            Email us
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export const ReviewStep = forwardRef(function ReviewStep({ state, selection, estimate, onEdit, problem, fallback }, ref) {
  return (
    <StepShell ref={ref} title="Review your request" intro="Check everything, then send it. You will not be charged. The owner replies with your quote.">
      <div className="rounded-xl border border-ink-200 bg-cream-50 px-4">
        <SelectionList selection={selection} contact={state.contact} onEdit={onEdit} />
      </div>
      {selection.rxWarnings.length > 0 ? (
        <InlineNotice tone="warn">We noticed a few unusual values and will double-check them with you before ordering.</InlineNotice>
      ) : null}
      <EstimateBox estimate={estimate} />
      <Disclaimer />
      <SubmitProblem problem={problem} fallback={fallback} />
    </StepShell>
  );
});
