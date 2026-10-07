import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { COLORS, labelOf } from "@shared/enums.js";
import { Button, Field, IconButton, Select, Skeleton, Textarea } from "@/components/ui/index.js";
import { formatPkr } from "@/lib/format.js";
import { imageUrl } from "@/lib/images.js";
import { ChoiceGroup, RadioCard } from "./ChoiceCards.jsx";
import { InlineNotice, StepShell } from "./StepShell.jsx";
import { MAX_FRAMES } from "./quoteState.js";
import { effectiveColor, effectiveSizeIndex, sizeText } from "./quoteRules.js";

const NOTE_COPY = {
  own: { label: "Tell us about your frame", hint: "For example: black rectangular acetate frame, about 52 mm wide." },
  undecided: { label: "What are you looking for?", hint: "Style, colour, budget or a photo link from our Instagram. We will suggest options." },
};

function FrameRow({ item, product, onChange, onRemove }) {
  const colorKey = effectiveColor(item, product);
  const sizeIndex = effectiveSizeIndex(item, product);
  return (
    <li className="flex gap-3 rounded-xl border border-ink-200 bg-cream-50 p-3">
      <img src={imageUrl(product.images[0])} alt={product.name} width="96" height="72" className="h-[72px] w-24 shrink-0 rounded-lg bg-cream-200 object-contain" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/p/${product.slug}`} className="focus-ring block truncate font-semibold text-ink-900 hover:underline">{product.name}</Link>
            <p className="text-sm text-ink-600">{formatPkr(product.price)} frame</p>
          </div>
          <IconButton label={`Remove ${product.name}`} onClick={onRemove}>
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {product.colors.length > 0 ? (
            <Field label="Colour">
              <Select value={colorKey} onChange={(event) => onChange({ colorKey: event.target.value })}>
                {product.colors.map((value) => <option key={value} value={value}>{labelOf(COLORS, value)}</option>)}
              </Select>
            </Field>
          ) : null}
          {product.sizes.length > 1 ? (
            <Field label="Size (lens-bridge-temple)">
              <Select value={sizeIndex} onChange={(event) => onChange({ sizeIndex: Number(event.target.value) })}>
                {product.sizes.map((size, index) => <option key={sizeText(size)} value={index}>{sizeText(size)}</option>)}
              </Select>
            </Field>
          ) : (
            <p className="self-end pb-3 text-sm text-ink-600">Size {sizeText(product.sizes[0])}</p>
          )}
        </div>
      </div>
    </li>
  );
}

function FramePicker({ catalog, items, onAdd }) {
  const available = catalog.frames.filter((product) => !items.some((item) => item.slug === product.slug));
  if (items.length >= MAX_FRAMES) return <InlineNotice>You can quote up to {MAX_FRAMES} frames at once.</InlineNotice>;
  if (available.length === 0) return null;
  return (
    <Field label={items.length === 0 ? "Pick a frame" : "Add another frame"}>
      <Select
        value=""
        onChange={(event) => {
          const product = catalog.frames.find((entry) => entry.slug === event.target.value);
          if (product) onAdd({ slug: product.slug, colorKey: product.colors[0] ?? null, sizeIndex: 0 });
        }}
      >
        <option value="">Choose from the shop</option>
        {available.map((product) => <option key={product.slug} value={product.slug}>{product.name} ({formatPkr(product.price)})</option>)}
      </Select>
    </Field>
  );
}

function ChosenFrames({ state, dispatch, catalog, error }) {
  if (catalog.status === "loading") return <Skeleton className="h-28 w-full" />;
  return (
    <div className="flex flex-col gap-4">
      {state.items.length > 0 ? (
        <ul className="grid gap-3">
          {state.items.map((item) => {
            const product = catalog.bySlug(item.slug);
            return product ? (
              <FrameRow
                key={item.slug}
                item={item}
                product={product}
                onChange={(patch) => dispatch({ type: "updateItem", slug: item.slug, patch })}
                onRemove={() => dispatch({ type: "removeItem", slug: item.slug })}
              />
            ) : (
              <li key={item.slug} className="flex items-center justify-between gap-3 rounded-xl border border-danger-600/30 bg-danger-100 p-3 text-sm text-danger-600">
                This frame is no longer available.
                <Button variant="secondary" size="sm" onClick={() => dispatch({ type: "removeItem", slug: item.slug })}>Remove</Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <InlineNotice>No frame selected yet. Pick one below or browse the shop.</InlineNotice>
      )}
      <FramePicker catalog={catalog} items={state.items} onAdd={(item) => dispatch({ type: "addItem", item })} />
      <Button to="/shop" variant="secondary" size="sm" className="self-start">Browse the shop</Button>
      {error ? <p role="alert" className="text-sm font-medium text-danger-600">{error}</p> : null}
    </div>
  );
}

export const FrameStep = forwardRef(function FrameStep({ state, dispatch, catalog, errors }, ref) {
  const noteCopy = NOTE_COPY[state.frameMode];
  const setMode = (frameMode) => dispatch({ type: "patch", patch: { frameMode } });
  return (
    <StepShell ref={ref} title="Choose your frame" intro="Start with a frame you like, or tell us what you have in mind.">
      <ChoiceGroup legend="How would you like to start?">
        <RadioCard name="frame-mode" value="choose" checked={state.frameMode === "choose"} onChange={setMode} title="Pick frames from our shop">
          Choose up to {MAX_FRAMES} frames and compare them in one quote.
        </RadioCard>
        <RadioCard name="frame-mode" value="own" checked={state.frameMode === "own"} onChange={setMode} title="I will use my own frame (lenses only)">
          Tell us about your frame. The owner will confirm it can take new lenses.
        </RadioCard>
        <RadioCard name="frame-mode" value="undecided" checked={state.frameMode === "undecided"} onChange={setMode} title="I have no frame in mind yet">
          Describe what you like and we will suggest frames.
        </RadioCard>
      </ChoiceGroup>
      {state.frameMode === "choose" ? (
        <ChosenFrames state={state} dispatch={dispatch} catalog={catalog} error={errors.frames} />
      ) : (
        <Field label={noteCopy.label} hint={noteCopy.hint} error={errors.frameNote} required>
          <Textarea
            value={state.frameNote}
            maxLength={200}
            onChange={(event) => dispatch({ type: "patch", patch: { frameNote: event.target.value } })}
          />
        </Field>
      )}
    </StepShell>
  );
});
