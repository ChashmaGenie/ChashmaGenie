import { BADGES } from "@shared/enums.js";
import { GroupField } from "@/admin/components/GroupField.jsx";
import { Section } from "@/admin/components/Section.jsx";
import { SwitchRow } from "@/admin/components/SwitchRow.jsx";
import { ChoiceCard } from "./ChoiceCard.jsx";
import { isLensCategory } from "./productDraft.js";

const BADGE_CHOICES = [{ value: "", label: "None" }, ...BADGES];

export function ProductOptions({ draft, update }) {
  const isLens = isLensCategory(draft.category);
  return (
    <Section id="options" title="Options">
      <div className="divide-y divide-ink-200">
        <SwitchRow label="Show in shop" hint="Turn off to hide it without deleting." checked={draft.visible} onChange={(visible) => update({ visible })} />
        <SwitchRow label="Featured on home" hint="Shows this item in the featured row on the home page." checked={draft.featured} onChange={(featured) => update({ featured })} />
        {isLens ? null : (
          <>
            <SwitchRow label="Works with prescription" hint="Customers can add their eye numbers to this frame." checked={draft.rxCompatible} onChange={(rxCompatible) => update({ rxCompatible })} />
            <SwitchRow label="Works with bifocal or progressive lenses" checked={draft.multifocalOk} onChange={(multifocalOk) => update({ multifocalOk })} />
          </>
        )}
      </div>
      <GroupField name="badge" legend="Badge on the photo">
        <div className="grid grid-cols-3 gap-2">
          {BADGE_CHOICES.map((badge) => (
            <ChoiceCard key={badge.value || "none"} name="badge" value={badge.value} checked={draft.badge === badge.value} onChange={() => update({ badge: badge.value })}>
              {badge.label}
            </ChoiceCard>
          ))}
        </div>
      </GroupField>
    </Section>
  );
}
