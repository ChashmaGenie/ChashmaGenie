import { forwardRef } from "react";
import { COATINGS, LENS_INDEXES, LENS_TREATMENTS, LENS_TYPES, TINT_COLORS, labelOf } from "@shared/enums.js";
import { Badge, Checkbox, Chip, Skeleton } from "@/components/ui/index.js";
import { formatPkr } from "@/lib/format.js";
import { ChoiceGroup, RadioCard } from "./ChoiceCards.jsx";
import { InlineNotice, StepShell } from "./StepShell.jsx";
import { includedCoatingLabels, optionalCoatings, showsTintPicker, sortLensesForUsage } from "./quoteRules.js";

const GENERIC_INDEX_ADVICE =
  "Stronger prescriptions usually need thinner lenses (a higher index). Add your prescription in the next step and we will point out the best match.";

function LensDetails({ lens }) {
  const details = lens.lens;
  const included = includedCoatingLabels(lens);
  return (
    <span className="mt-2 flex flex-col gap-2">
      <span className="flex flex-wrap gap-1.5">
        {[labelOf(LENS_TYPES, details.lensType), labelOf(LENS_INDEXES, details.index), labelOf(LENS_TREATMENTS, details.treatment)].map((text) => (
          <Badge key={text} tone="neutral">{text}</Badge>
        ))}
      </span>
      {included.length > 0 ? <span className="text-sm text-ink-600">Included: {included.join(", ")}</span> : null}
      <span className="text-sm text-ink-800">
        Price: quoted by owner
        {lens.price > 0 ? <span className="text-ink-600"> (Estimated from {formatPkr(lens.price)})</span> : null}
      </span>
    </span>
  );
}

function LensBadges({ lens, suggested, recommendation }) {
  const recommended = recommendation?.index === lens.lens.index;
  return (
    <>
      {recommended ? <Badge tone="teal">Recommended for your prescription</Badge> : null}
      {suggested ? <Badge tone="gold">Suggested for your use</Badge> : null}
    </>
  );
}

function LensList({ state, dispatch, catalog, recommendation, eligible, hiddenCount }) {
  const ordered = sortLensesForUsage(eligible, state.usage);
  return (
    <>
      {ordered.map(({ lens, suggested }) => (
        <RadioCard
          key={lens.slug}
          name="lens"
          value={lens.slug}
          checked={state.lensChoice === "package" && state.lensSlug === lens.slug}
          onChange={(slug) => dispatch({ type: "chooseLensPackage", slug })}
          title={lens.name}
          badge={<LensBadges lens={lens} suggested={suggested} recommendation={recommendation} />}
        >
          {lens.description}
          <LensDetails lens={lens} />
        </RadioCard>
      ))}
      <RadioCard
        name="lens"
        value="suggest"
        checked={state.lensChoice === "suggest"}
        onChange={() => dispatch({ type: "patch", patch: { lensChoice: "suggest", lensSlug: null, tintColor: null } })}
        title="Not sure - suggest for me"
      >
        Owner to recommend. We will pick a package after seeing your prescription.
      </RadioCard>
      {hiddenCount > 0 ? (
        <InlineNotice>
          {hiddenCount} progressive or bifocal {hiddenCount === 1 ? "package is" : "packages are"} hidden because a frame you chose does not support multifocal lenses.
        </InlineNotice>
      ) : null}
      {catalog.lenses.length === 0 ? <InlineNotice>Lens packages are not listed right now. Choose "suggest for me" and we will help.</InlineNotice> : null}
    </>
  );
}

function ExtrasPicker({ state, dispatch, lens }) {
  const options = lens ? optionalCoatings(lens) : COATINGS.filter((coating) => !coating.included);
  if (options.length === 0) return null;
  return (
    <ChoiceGroup legend="Optional extras" hint="Prices for extras are confirmed by the owner.">
      {options.map((coating) => (
        <Checkbox
          key={coating.value}
          label={coating.label}
          checked={state.extras.includes(coating.value)}
          onChange={() => dispatch({ type: "toggleExtra", extra: coating.value })}
          className="rounded-xl border border-ink-300 bg-cream-50 px-4"
        />
      ))}
    </ChoiceGroup>
  );
}

function TintPicker({ state, dispatch, error }) {
  return (
    <fieldset>
      <legend className="mb-2 text-base font-semibold text-ink-900">Tint colour</legend>
      <div className="flex flex-wrap gap-2">
        {TINT_COLORS.map((tint) => (
          <Chip key={tint.value} selected={state.tintColor === tint.value} onClick={() => dispatch({ type: "patch", patch: { tintColor: tint.value } })}>
            {tint.label}
          </Chip>
        ))}
      </div>
      {error ? <p role="alert" className="mt-2 text-sm font-medium text-danger-600">{error}</p> : null}
    </fieldset>
  );
}

export const LensStep = forwardRef(function LensStep({ state, dispatch, errors, catalog, lens, recommendation, eligibility }, ref) {
  return (
    <StepShell ref={ref} title="Choose your lenses" intro="Pick a lens package. The owner confirms the final price and suitability.">
      {recommendation ? (
        <InlineNotice>
          <strong>Recommended for your prescription:</strong> {labelOf(LENS_INDEXES, recommendation.index)}. {recommendation.reason}
        </InlineNotice>
      ) : (
        <InlineNotice>{GENERIC_INDEX_ADVICE}</InlineNotice>
      )}
      {catalog.status === "loading" ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <ChoiceGroup legend="Lens package" error={errors.lens}>
          <LensList
            state={state}
            dispatch={dispatch}
            catalog={catalog}
            recommendation={recommendation}
            eligible={eligibility.eligible}
            hiddenCount={eligibility.hiddenCount}
          />
        </ChoiceGroup>
      )}
      {showsTintPicker(lens) ? <TintPicker state={state} dispatch={dispatch} error={errors.tintColor} /> : null}
      {state.lensChoice ? <ExtrasPicker state={state} dispatch={dispatch} lens={lens} /> : null}
    </StepShell>
  );
});
