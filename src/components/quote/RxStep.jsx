import { forwardRef, useState } from "react";
import { HelpCircle, ShieldCheck } from "lucide-react";
import { PD_MODE } from "@shared/enums.js";
import { Button, Checkbox, Field, Input } from "@/components/ui/index.js";
import { ChoiceGroup, RadioCard } from "./ChoiceCards.jsx";
import { InlineNotice, StepShell } from "./StepShell.jsx";
import { PdHelpModal, RxHelpModal } from "./RxHelpModals.jsx";
import { RxEyeBlock } from "./RxEyeBlock.jsx";
import { checkRx, needsAdd } from "./quoteRules.js";

const SIDES = ["right", "left"];

function MillimetreControl({ value, onChange, ...fieldProps }) {
  return (
    <div className="relative">
      <Input {...fieldProps} inputMode="decimal" autoComplete="off" className="pe-12" value={value} onChange={(event) => onChange(event.target.value)} />
      <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-ink-600" aria-hidden="true">mm</span>
    </div>
  );
}

function MillimetreInput({ label, value, error, onChange }) {
  return (
    <Field label={label} error={error} required>
      <MillimetreControl value={value} onChange={onChange} />
    </Field>
  );
}

function PdSection({ state, dispatch, errors, onOpenHelp }) {
  const setPd = (field) => (value) => dispatch({ type: "setPd", field, value });
  return (
    <div className="flex flex-col gap-3">
      <ChoiceGroup legend="Pupillary distance (PD)" error={errors["pd.mode"]}>
        {PD_MODE.map((mode) => (
          <RadioCard
            key={mode.value}
            name="pd-mode"
            value={mode.value}
            checked={state.pdMode === mode.value}
            onChange={(pdMode) => dispatch({ type: "patch", patch: { pdMode } })}
            title={mode.label}
          >
            {mode.value === "unknown" ? "The owner will help you with it." : null}
          </RadioCard>
        ))}
      </ChoiceGroup>
      {state.pdMode === "single" ? <MillimetreInput label="PD" value={state.pd.single} error={errors["pd.single"]} onChange={setPd("single")} /> : null}
      {state.pdMode === "dual" ? (
        <div className="grid grid-cols-2 gap-3">
          <MillimetreInput label="Right PD" value={state.pd.right} error={errors["pd.right"]} onChange={setPd("right")} />
          <MillimetreInput label="Left PD" value={state.pd.left} error={errors["pd.left"]} onChange={setPd("left")} />
        </div>
      ) : null}
      <Button variant="ghost" size="sm" className="self-start" onClick={onOpenHelp}>
        <HelpCircle className="h-5 w-5" aria-hidden="true" />
        How to measure PD
      </Button>
    </div>
  );
}

function PrescriptionEntry({ state, dispatch, errors, lens }) {
  const [helpOpen, setHelpOpen] = useState(null);
  const check = checkRx(state, lens);
  const setEye = (side) => (field, value) => dispatch({ type: "setEye", side, field, value });
  return (
    <div className="flex flex-col gap-5">
      <InlineNotice>Check that the + and - signs match your prescription.</InlineNotice>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => setHelpOpen("rx")}>
        <HelpCircle className="h-5 w-5" aria-hidden="true" />
        Where do I find this?
      </Button>
      <Checkbox
        label="My cylinder is written with a plus (+)"
        hint="We will convert it to the standard minus form for you."
        checked={state.cylFormat === "plus"}
        onChange={(event) => dispatch({ type: "setCylFormat", cylFormat: event.target.checked ? "plus" : "minus" })}
      />
      {SIDES.map((side) => (
        <RxEyeBlock key={side} side={side} eye={state[side]} cylFormat={state.cylFormat} needsAdd={needsAdd(lens)} errors={errors} onChange={setEye(side)} />
      ))}
      <PdSection state={state} dispatch={dispatch} errors={errors} onOpenHelp={() => setHelpOpen("pd")} />
      {check.warnings.length > 0 ? (
        <InlineNotice tone="warn">
          <p className="font-semibold">Please double-check</p>
          <ul className="mt-1 list-disc ps-5">
            {check.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
          <p className="mt-1">These do not stop your request. We will confirm them with you.</p>
        </InlineNotice>
      ) : null}
      <RxHelpModal open={helpOpen === "rx"} onClose={() => setHelpOpen(null)} />
      <PdHelpModal open={helpOpen === "pd"} onClose={() => setHelpOpen(null)} />
    </div>
  );
}

export const RxStep = forwardRef(function RxStep({ state, dispatch, errors, lens }, ref) {
  const setChoice = (rxChoice) => dispatch({ type: "patch", patch: { rxChoice } });
  return (
    <StepShell ref={ref} title="Your prescription" intro="Enter it exactly as written by your eye doctor, or share it later.">
      <ChoiceGroup legend="How would you like to share it?" error={errors.rxChoice}>
        <RadioCard name="rx-choice" value="enter" checked={state.rxChoice === "enter"} onChange={setChoice} title="Enter my prescription">
          Fill in the numbers now.
        </RadioCard>
        <RadioCard name="rx-choice" value="send_later" checked={state.rxChoice === "send_later"} onChange={setChoice} title="I'll send it on WhatsApp or email later">
          Always fine. This never blocks your request.
        </RadioCard>
        <RadioCard name="rx-choice" value="none" checked={state.rxChoice === "none"} onChange={setChoice} title="I don't have a prescription">
          For non-prescription glasses, such as plain or blue-light lenses.
        </RadioCard>
      </ChoiceGroup>
      {state.rxChoice === "enter" ? <PrescriptionEntry state={state} dispatch={dispatch} errors={errors} lens={lens} /> : null}
      {state.rxChoice === "enter" || state.rxChoice === "send_later" ? (
        <InlineNotice>Prescription photo: after you tap Send on WhatsApp you can attach a photo of your prescription in the chat.</InlineNotice>
      ) : null}
      <p className="flex gap-2 text-sm text-ink-600">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
        Your prescription and contact details are used only to prepare your quote. They are stored on our server for up to 180 days, deleted on request by email, and never sent to analytics or advertising pixels.
      </p>
    </StepShell>
  );
});
