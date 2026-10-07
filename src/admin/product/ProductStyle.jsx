import { Check, Plus, Trash2 } from "lucide-react";
import { COLORS, FACE_SHAPES, FEATURES, MATERIALS, RIM_TYPES, SHAPES, SIZE_LABELS, deriveSizeLabel, labelOf } from "@shared/enums.js";
import { Button } from "@/components/ui/Button.jsx";
import { Checkbox } from "@/components/ui/Choice.jsx";
import { Field } from "@/components/ui/Field.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { FieldBox } from "@/admin/components/FieldBox.jsx";
import { GroupField } from "@/admin/components/GroupField.jsx";
import { HelpTip } from "@/admin/components/HelpTip.jsx";
import { Section } from "@/admin/components/Section.jsx";
import { ChoiceCard } from "./ChoiceCard.jsx";
import { ShapeGlyph } from "./ShapeGlyph.jsx";
import { suggestFaceShapes, toggledInList, withSizeAdded, withSizeChanged, withSizeRemoved } from "./productDraft.js";

const MAX_COLORS = 6;

const swatchBackground = (color) => color.gradient ?? color.hex;

function Swatch({ color }) {
  return (
    <span
      aria-hidden="true"
      className="h-6 w-6 shrink-0 rounded-full border border-ink-300"
      style={{ background: swatchBackground(color) }}
    />
  );
}

function ShapePicker({ draft, update, error }) {
  const choose = (shape) => update({ shape, ...(draft.faceShapesTouched ? {} : { faceShapes: suggestFaceShapes(shape) }) });
  return (
    <GroupField name="shape" legend="Shape" error={error}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {SHAPES.map((shape) => (
          <ChoiceCard key={shape.value} name="shape" value={shape.value} checked={draft.shape === shape.value} onChange={() => choose(shape.value)} className="flex-col px-1 text-sm">
            <ShapeGlyph shape={shape.value} />
            {shape.label}
          </ChoiceCard>
        ))}
      </div>
    </GroupField>
  );
}

function SelectCards({ name, legend, options, value, onChange, error }) {
  return (
    <GroupField name={name} legend={legend} error={error}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <ChoiceCard key={option.value} name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)}>
            {option.label}
          </ChoiceCard>
        ))}
      </div>
    </GroupField>
  );
}

function ColourPicker({ draft, update, error }) {
  const atLimit = draft.colors.length >= MAX_COLORS;
  return (
    <GroupField name="colors" legend="Colours" hint={`Pick every colour you have. Up to ${MAX_COLORS}.`} error={error}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {COLORS.map((color) => {
          const checked = draft.colors.includes(color.value);
          return (
            <ChoiceCard key={color.value} type="checkbox" name="colors" value={color.value} checked={checked} disabled={atLimit && !checked} onChange={() => update({ colors: toggledInList(draft.colors, color.value) })} className="justify-start">
              <Swatch color={color} />
              <span className="flex-1 text-start">{color.label}</span>
              {checked ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
            </ChoiceCard>
          );
        })}
      </div>
    </GroupField>
  );
}

function SizeRow({ size, index, errors, onChange, onRemove, canRemove }) {
  const numberField = (key, label) => (
    <FieldBox name={`sizes.${index}.${key}`}>
      <Field label={label} error={errors[`sizes.${index}.${key}`]}>
        <Input inputMode="numeric" pattern="[0-9]*" value={size[key]} onChange={(event) => onChange(index, key, event.target.value.replace(/\D/g, ""))} />
      </Field>
    </FieldBox>
  );
  return (
    <div className="rounded-xl border border-ink-200 p-3">
      <div className="grid grid-cols-3 gap-3">
        {numberField("lens", "Lens width (mm)")}
        {numberField("bridge", "Bridge (mm)")}
        {numberField("temple", "Arm (mm)")}
      </div>
      {canRemove ? (
        <Button variant="ghost" size="sm" className="mt-2 text-danger-600" onClick={() => onRemove(index)}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Remove this size
        </Button>
      ) : null}
    </div>
  );
}

function SizesEditor({ draft, update, errors }) {
  const label = labelOf(SIZE_LABELS, deriveSizeLabel(draft.sizes[0]?.lens));
  const change = (index, key, value) => update({ sizes: withSizeChanged(draft.sizes, index, key, value) });
  return (
    <GroupField
      name="sizes"
      legend="Size"
      hint="Look inside the arm of the frame. You will see numbers like 52-18-140."
      error={errors.sizes}
    >
      <p className="mb-2 flex items-center gap-1 text-sm">
        Where do I find these numbers?
        <HelpTip label="Where to find the size numbers">The three numbers are printed inside one arm: 52-18-140 means lens width 52 mm, bridge 18 mm, arm length 140 mm.</HelpTip>
      </p>
      <div className="space-y-3">
        {draft.sizes.map((size, index) => (
          <SizeRow key={index} size={size} index={index} errors={errors} onChange={change} onRemove={(position) => update({ sizes: withSizeRemoved(draft.sizes, position) })} canRemove={draft.sizes.length > 1} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={() => update({ sizes: withSizeAdded(draft.sizes) })}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another size
        </Button>
        {label ? <p className="text-sm text-ink-600">Size label in the shop: <strong className="text-ink-900">{label}</strong></p> : null}
      </div>
    </GroupField>
  );
}

export function ProductStyle({ draft, update, errors }) {
  return (
    <Section id="style" title="Style" description="Helps customers find this frame with the shop filters.">
      <ShapePicker draft={draft} update={update} error={errors.shape} />
      <SelectCards name="rim" legend="Frame type" options={RIM_TYPES} value={draft.rim} onChange={(rim) => update({ rim })} error={errors.rim} />
      <SelectCards name="material" legend="Material" options={MATERIALS} value={draft.material} onChange={(material) => update({ material })} error={errors.material} />
      <ColourPicker draft={draft} update={update} error={errors.colors} />
      <GroupField name="features" legend="Features">
        <div className="grid sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Checkbox key={feature.value} label={feature.label} checked={draft.features.includes(feature.value)} onChange={() => update({ features: toggledInList(draft.features, feature.value) })} />
          ))}
        </div>
      </GroupField>
      <GroupField name="faceShapes" legend="Suits these face shapes" hint="We suggest these from the frame shape. Change them if you like.">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {FACE_SHAPES.map((face) => (
            <Checkbox key={face.value} label={face.label} checked={draft.faceShapes.includes(face.value)} onChange={() => update({ faceShapes: toggledInList(draft.faceShapes, face.value), faceShapesTouched: true })} />
          ))}
        </div>
      </GroupField>
      <SizesEditor draft={draft} update={update} errors={errors} />
    </Section>
  );
}
