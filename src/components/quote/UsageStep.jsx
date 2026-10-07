import { forwardRef } from "react";
import { USAGE } from "@shared/enums.js";
import { ChoiceGroup, RadioCard } from "./ChoiceCards.jsx";
import { StepShell } from "./StepShell.jsx";

export const UsageStep = forwardRef(function UsageStep({ state, dispatch, errors }, ref) {
  return (
    <StepShell ref={ref} title="How will you use them?" intro="This helps us suggest the right lenses and coatings.">
      <ChoiceGroup legend="Main use" error={errors.usage}>
        {USAGE.map((entry) => (
          <RadioCard
            key={entry.value}
            name="usage"
            value={entry.value}
            checked={state.usage === entry.value}
            onChange={(usage) => dispatch({ type: "setUsage", usage })}
            title={entry.label}
          >
            {entry.blurb}
          </RadioCard>
        ))}
      </ChoiceGroup>
    </StepShell>
  );
});
