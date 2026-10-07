import { ADD_VALUES, CYL_MINUS_VALUES, CYL_PLUS_VALUES, SPH_VALUES, formatDiopter, parseDiopter } from "@shared/rx.js";
import { Field, Input, Select } from "@/components/ui/index.js";

const SIDE_TITLES = { right: "Right eye (OD)", left: "Left eye (OS)" };

const optionLabel = (value, zeroLabel) => (value === 0 ? zeroLabel : formatDiopter(value));

function DiopterSelect({ values, zeroLabel, value, onChange, placeholder, ...fieldProps }) {
  return (
    <Select {...fieldProps} value={value} onChange={(event) => onChange(event.target.value)}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {values.map((entry) => <option key={entry} value={String(entry)}>{optionLabel(entry, zeroLabel)}</option>)}
    </Select>
  );
}

const hasCylinder = (eye) => parseDiopter(eye.cyl) !== 0 && eye.cyl !== "";

export function RxEyeBlock({ side, eye, cylFormat, needsAdd, errors, onChange }) {
  const fieldError = (name) => errors[`${side}.${name}`];
  const cylValues = cylFormat === "plus" ? CYL_PLUS_VALUES : CYL_MINUS_VALUES;
  return (
    <fieldset className="rounded-xl border border-ink-200 bg-cream-50 p-4">
      <legend className="px-2 text-lg font-semibold text-ink-900">{SIDE_TITLES[side]}</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="SPH" hint="Sphere power" error={fieldError("sph")} required>
          <DiopterSelect values={SPH_VALUES} zeroLabel="0.00 / Plano" value={eye.sph} onChange={(value) => onChange("sph", value)} placeholder="Choose" />
        </Field>
        <Field label="CYL" hint="Cylinder (astigmatism)" error={fieldError("cyl")}>
          <DiopterSelect values={cylValues} zeroLabel="0.00 / None" value={eye.cyl} onChange={(value) => onChange("cyl", value)} />
        </Field>
        {hasCylinder(eye) ? (
          <Field label="AXIS" hint="1 to 180" error={fieldError("axis")} required>
            <Input inputMode="numeric" autoComplete="off" maxLength={3} value={eye.axis} onChange={(event) => onChange("axis", event.target.value.replace(/\D/g, ""))} />
          </Field>
        ) : null}
        {needsAdd ? (
          <Field label="ADD" hint="Reading power" error={fieldError("add")} required>
            <DiopterSelect values={ADD_VALUES} zeroLabel="" value={eye.add} onChange={(value) => onChange("add", value)} placeholder="Choose" />
          </Field>
        ) : null}
      </div>
    </fieldset>
  );
}
