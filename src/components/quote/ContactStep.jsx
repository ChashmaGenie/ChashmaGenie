import { forwardRef } from "react";
import { CONTACT_CHANNELS } from "@shared/enums.js";
import { PK_CITIES } from "@shared/pk.js";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/index.js";
import { CONSENT_LABEL, Disclaimer } from "./Disclaimer.jsx";
import { StepShell } from "./StepShell.jsx";

const NOTES_LIMIT = 500;

export const ContactStep = forwardRef(function ContactStep({ state, dispatch, errors }, ref) {
  const { contact } = state;
  const setContact = (field) => (event) => dispatch({ type: "setContact", field, value: event.target.value });
  return (
    <StepShell ref={ref} title="Your details" intro="So the owner can send you your quote. We never share your details.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name" error={errors.name} required>
          <Input autoComplete="name" value={contact.name} onChange={setContact("name")} />
        </Field>
        <Field label="Mobile number" hint="For example 0300 1234567" error={errors.phone} required>
          <Input type="tel" inputMode="tel" autoComplete="tel" value={contact.phone} onChange={setContact("phone")} />
        </Field>
        <Field label="City" error={errors.city} required>
          <Input list="pk-cities" autoComplete="address-level2" value={contact.city} onChange={setContact("city")} />
        </Field>
        <Field label="Best way to reach you">
          <Select value={contact.channel} onChange={setContact("channel")}>
            {CONTACT_CHANNELS.map((channel) => <option key={channel.value} value={channel.value}>{channel.label}</option>)}
          </Select>
        </Field>
        <Field label="Email (optional)" error={errors.email} className="md:col-span-2" required={contact.channel === "email"}>
          <Input type="email" autoComplete="email" value={contact.email} onChange={setContact("email")} />
        </Field>
        <Field
          label="Anything else we should know? (optional)"
          hint={`${contact.notes.length} of ${NOTES_LIMIT} characters`}
          error={errors.notes}
          className="md:col-span-2"
        >
          <Textarea dir="auto" maxLength={NOTES_LIMIT} value={contact.notes} onChange={setContact("notes")} />
        </Field>
      </div>
      <datalist id="pk-cities">
        {PK_CITIES.map((city) => <option key={city} value={city} />)}
      </datalist>
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={state.website} onChange={(event) => dispatch({ type: "patch", patch: { website: event.target.value } })} />
        </label>
      </div>
      <Disclaimer />
      <div>
        <Checkbox
          label={CONSENT_LABEL}
          checked={state.consent}
          aria-invalid={errors.consent ? true : undefined}
          onChange={(event) => dispatch({ type: "patch", patch: { consent: event.target.checked } })}
        />
        {errors.consent ? <p role="alert" className="text-sm font-medium text-danger-600">{errors.consent}</p> : null}
      </div>
    </StepShell>
  );
});
