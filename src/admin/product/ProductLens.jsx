import { COATINGS, LENS_INDEXES, LENS_TREATMENTS, LENS_TYPES } from "@shared/enums.js";
import { Checkbox } from "@/components/ui/Choice.jsx";
import { Field } from "@/components/ui/Field.jsx";
import { Select, Textarea } from "@/components/ui/Input.jsx";
import { FieldBox } from "@/admin/components/FieldBox.jsx";
import { GroupField } from "@/admin/components/GroupField.jsx";
import { Section } from "@/admin/components/Section.jsx";
import { toggledInList } from "./productDraft.js";

function OptionSelect({ name, label, options, value, onChange, error }) {
  return (
    <FieldBox name={name}>
      <Field label={label} error={error} required>
        <Select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
      </Field>
    </FieldBox>
  );
}

export function ProductLens({ draft, update, errors }) {
  const { lens } = draft;
  const change = (patch) => update({ lens: { ...lens, ...patch } });
  return (
    <Section id="lens" title="Lens details" description="What this lens package is and what it includes.">
      <div className="grid gap-4 sm:grid-cols-3">
        <OptionSelect name="lens.lensType" label="Lens type" options={LENS_TYPES} value={lens.lensType} onChange={(lensType) => change({ lensType })} error={errors["lens.lensType"]} />
        <OptionSelect name="lens.index" label="Thickness (index)" options={LENS_INDEXES} value={lens.index} onChange={(index) => change({ index })} error={errors["lens.index"]} />
        <OptionSelect name="lens.treatment" label="Treatment" options={LENS_TREATMENTS} value={lens.treatment} onChange={(treatment) => change({ treatment })} error={errors["lens.treatment"]} />
      </div>
      <GroupField name="lens.coatings" legend="Coatings" hint="Anti-scratch and UV400 come with every lens.">
        <div className="grid sm:grid-cols-2">
          {COATINGS.map((coating) => (
            <Checkbox
              key={coating.value}
              label={coating.included ? `${coating.label} (included)` : coating.label}
              checked={coating.included || lens.coatings.includes(coating.value)}
              disabled={coating.included}
              onChange={() => change({ coatings: toggledInList(lens.coatings, coating.value) })}
            />
          ))}
        </div>
      </GroupField>
      <FieldBox name="lens.note">
        <Field label="Note for customers (optional)" hint="For example: best for powers up to -6.00">
          <Textarea rows={3} value={lens.note} maxLength={300} onChange={(event) => change({ note: event.target.value })} />
        </Field>
      </FieldBox>
    </Section>
  );
}
