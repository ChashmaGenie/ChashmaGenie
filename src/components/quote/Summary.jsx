import { useState } from "react";
import { ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/index.js";
import { formatPkr } from "@/lib/format.js";
import { imageUrl } from "@/lib/images.js";
import { cn } from "@/lib/cn.js";
import { STEP } from "./quoteRules.js";

function Row({ title, step, onEdit, children }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink-200 py-3 last:border-b-0">
      <div className="min-w-0">
        <h3 className="label-caps text-ink-600">{title}</h3>
        <div className="mt-1 text-sm text-ink-800">{children}</div>
      </div>
      {onEdit ? (
        <Button variant="ghost" size="sm" onClick={() => onEdit(step)} aria-label={`Edit ${title}`}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Edit
        </Button>
      ) : null}
    </div>
  );
}

function FrameLine({ frame }) {
  return (
    <li className="flex items-center gap-3">
      <img src={imageUrl(frame.image)} alt="" width="56" height="42" className="h-[42px] w-14 shrink-0 rounded-md bg-cream-200 object-contain" />
      <span className="min-w-0">
        <span className="block font-medium">{frame.name}</span>
        <span className="block text-ink-600">{[frame.colorLabel, frame.sizeText].filter(Boolean).join(", ")} - {formatPkr(frame.price)}</span>
      </span>
    </li>
  );
}

function FrameRows({ selection }) {
  if (selection.frames.length > 0) return <ul className="grid gap-2">{selection.frames.map((frame) => <FrameLine key={frame.slug} frame={frame} />)}</ul>;
  if (selection.frameNote) return <p>{selection.frameMode === "own" ? "Own frame: " : "Looking for: "}{selection.frameNote}</p>;
  return <p className="text-ink-600">Not chosen yet</p>;
}

function LensRows({ selection }) {
  if (!selection.lens) return <p className="text-ink-600">Not chosen yet</p>;
  return (
    <>
      <p className="font-medium">{selection.lens.name}</p>
      {selection.lens.detail ? <p className="text-ink-600">{selection.lens.detail}</p> : null}
      {selection.tintLabel ? <p>Tint: {selection.tintLabel}</p> : null}
      {selection.extraLabels.length > 0 ? <p>Extras: {selection.extraLabels.join(", ")}</p> : null}
    </>
  );
}

function RxRows({ selection }) {
  if (selection.rxSummary) {
    return (
      <>
        <p>Right: {selection.rxSummary.right}</p>
        <p>Left: {selection.rxSummary.left}</p>
        <p>{selection.rxSummary.pd}</p>
      </>
    );
  }
  return <p className={cn(!selection.prescriptionText && "text-ink-600")}>{selection.prescriptionText || "Not added yet"}</p>;
}

export function SelectionList({ selection, contact, onEdit }) {
  return (
    <div>
      <Row title="Frame" step={STEP.frame} onEdit={onEdit}><FrameRows selection={selection} /></Row>
      <Row title="Usage" step={STEP.usage} onEdit={onEdit}>{selection.usageLabel || <span className="text-ink-600">Not chosen yet</span>}</Row>
      <Row title="Lenses" step={STEP.lens} onEdit={onEdit}><LensRows selection={selection} /></Row>
      <Row title="Prescription" step={STEP.rx} onEdit={onEdit}><RxRows selection={selection} /></Row>
      {contact ? (
        <Row title="Your details" step={STEP.contact} onEdit={onEdit}>
          <p>{contact.name}</p>
          <p>{contact.phone}{contact.city ? `, ${contact.city}` : ""}</p>
          {contact.email ? <p>{contact.email}</p> : null}
          {contact.notes ? <p className="whitespace-pre-line text-ink-600">{contact.notes}</p> : null}
        </Row>
      ) : null}
    </div>
  );
}

export function priceRangeText(estimate) {
  if (estimate.low === 0 && estimate.high === 0) return "To be quoted";
  const range = estimate.low === estimate.high ? formatPkr(estimate.low) : `${formatPkr(estimate.low)} - ${formatPkr(estimate.high)}`;
  return estimate.lensPending ? `${range} + lenses` : range;
}

export function EstimateBox({ estimate }) {
  return (
    <div className="rounded-xl bg-ink-900 p-4 text-cream-100 on-dark">
      <p className="label-caps text-cream-100/80">Estimated total</p>
      <p className="tabular mt-1 font-display text-2xl font-semibold">{priceRangeText(estimate)}</p>
      <p className="mt-2 text-sm text-cream-100/80">
        {estimate.hasFrames ? "" : "Frame price is quoted by the owner. "}
        Estimate only. Extras and special lenses may change it, and the owner confirms the final price before any order.
      </p>
    </div>
  );
}

export function DesktopSummary({ selection, estimate }) {
  return (
    <aside aria-label="Your selection" className="sticky top-28 hidden flex-col gap-4 lg:flex">
      <div className="rounded-xl border border-ink-200 bg-cream-50 px-4">
        <h2 className="pt-4 text-xl">Your selection</h2>
        <SelectionList selection={selection} />
      </div>
      <EstimateBox estimate={estimate} />
    </aside>
  );
}

export function MobileSummary({ selection, estimate }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-[var(--header-height)] z-30 -mx-4 border-b border-ink-200 bg-cream-50 px-4 md:-mx-6 md:px-6 lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-selection"
        onClick={() => setOpen(!open)}
        className="focus-ring flex min-h-[48px] w-full items-center justify-between gap-3 text-start"
      >
        <span className="font-semibold text-ink-900">Your selection</span>
        <span className="flex items-center gap-2 text-sm text-ink-600">
          <span className="tabular">{priceRangeText(estimate)}</span>
          <ChevronDown className={cn("h-5 w-5 transition-transform duration-150", open && "rotate-180")} aria-hidden="true" />
        </span>
      </button>
      <div id="mobile-selection" hidden={!open} className="max-h-[60vh] overflow-y-auto pb-4">
        <SelectionList selection={selection} />
        <EstimateBox estimate={estimate} />
      </div>
    </div>
  );
}
