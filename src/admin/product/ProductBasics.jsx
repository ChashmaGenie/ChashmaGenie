import { CATEGORIES, GENDERS, STOCK_STATUS } from "@shared/enums.js";
import { Field } from "@/components/ui/Field.jsx";
import { Input, Textarea } from "@/components/ui/Input.jsx";
import { Price } from "@/components/ui/Price.jsx";
import { discountPercent } from "@/lib/format.js";
import { FieldBox } from "@/admin/components/FieldBox.jsx";
import { GroupField } from "@/admin/components/GroupField.jsx";
import { Section } from "@/admin/components/Section.jsx";
import { ChoiceCard } from "./ChoiceCard.jsx";
import { isLensCategory } from "./productDraft.js";

function RadioCards({ name, options, value, onChange, columns }) {
  return (
    <div className={`grid gap-2 ${columns}`}>
      {options.map((option) => (
        <ChoiceCard key={option.value} name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)}>
          {option.label}
        </ChoiceCard>
      ))}
    </div>
  );
}

function PricePreview({ price, compareAtPrice }) {
  const amount = Number(price);
  const compareAt = Number(compareAtPrice);
  if (!price || Number.isNaN(amount)) return null;
  const percent = discountPercent(amount, compareAt);
  return (
    <div className="rounded-xl bg-cream-200 p-3" aria-live="polite">
      <p className="text-sm text-ink-600">How the price will look in the shop</p>
      <div className="flex flex-wrap items-baseline gap-3">
        <Price amount={amount} compareAt={compareAt} size="lg" />
        {percent > 0 ? <span className="text-sm font-semibold text-teal-600">{percent}% off</span> : null}
      </div>
    </div>
  );
}

export function ProductBasics({ draft, update, errors }) {
  const isLens = isLensCategory(draft.category);
  return (
    <Section id="basics" title="Basics" description="The essentials every customer sees first.">
      <FieldBox name="name">
        <Field label="Name" required error={errors.name} hint="For example: Classic Gold Aviator">
          <Input value={draft.name} maxLength={80} onChange={(event) => update({ name: event.target.value })} autoComplete="off" />
        </Field>
      </FieldBox>
      <GroupField name="category" legend="Type" error={errors.category}>
        <RadioCards name="category" options={CATEGORIES} value={draft.category} onChange={(category) => update({ category })} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
      </GroupField>
      <GroupField name="gender" legend="Who is it for?" error={errors.gender}>
        <RadioCards name="gender" options={GENDERS} value={draft.gender} onChange={(gender) => update({ gender })} columns="grid-cols-2 sm:grid-cols-4" />
      </GroupField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldBox name="price">
          <Field label={isLens ? "Starting extra price (Rs)" : "Price (Rs)"} required error={errors.price} hint={isLens ? "The lowest extra amount this lens adds to an order." : undefined}>
            <Input inputMode="numeric" pattern="[0-9]*" value={draft.price} onChange={(event) => update({ price: event.target.value.replace(/\D/g, "") })} />
          </Field>
        </FieldBox>
        <FieldBox name="compareAtPrice">
          <Field label="Old price (shows as a discount)" error={errors.compareAtPrice} hint="Optional. Must be higher than the price.">
            <Input inputMode="numeric" pattern="[0-9]*" value={draft.compareAtPrice} onChange={(event) => update({ compareAtPrice: event.target.value.replace(/\D/g, "") })} />
          </Field>
        </FieldBox>
      </div>
      <PricePreview price={draft.price} compareAtPrice={draft.compareAtPrice} />
      <FieldBox name="description">
        <Field label="Short description" error={errors.description} hint="Up to 1000 letters. Say what makes it special.">
          <Textarea value={draft.description} maxLength={1000} onChange={(event) => update({ description: event.target.value })} />
        </Field>
      </FieldBox>
      <FieldBox name="descriptionUr">
        <Field label="Description in Urdu (optional)" error={errors.descriptionUr}>
          <Textarea dir="rtl" lang="ur" value={draft.descriptionUr} maxLength={1000} onChange={(event) => update({ descriptionUr: event.target.value })} />
        </Field>
      </FieldBox>
      <GroupField name="stock" legend="Stock" error={errors.stock}>
        <RadioCards name="stock" options={STOCK_STATUS} value={draft.stock} onChange={(stock) => update({ stock })} columns="grid-cols-1 sm:grid-cols-3" />
      </GroupField>
    </Section>
  );
}
