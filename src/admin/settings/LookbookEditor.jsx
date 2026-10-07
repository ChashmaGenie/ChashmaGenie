import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Field } from "@/components/ui/Field.jsx";
import { Input, Select } from "@/components/ui/Input.jsx";
import { firstImageUrl } from "@/lib/images.js";
import { useAdminCatalog } from "@/admin/data/AdminCatalog.jsx";
import { MAX_LOOKBOOK, withLookbookCaption, withLookbookEntryAdded, withLookbookEntryMoved, withoutLookbookEntry } from "./settingsDraft.js";

function LookbookRow({ entry, index, total, product, onCaption, onMove, onRemove }) {
  const name = product?.name ?? entry.productSlug;
  return (
    <li className="flex items-center gap-3 rounded-xl border border-ink-200 p-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-200">
        {product ? <img src={firstImageUrl(product)} alt="" className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold">{name}</p>
        <Field label="Caption (optional)">
          <Input value={entry.caption} maxLength={80} onChange={(event) => onCaption(entry.id, event.target.value)} />
        </Field>
      </div>
      <div className="flex flex-col">
        <button type="button" aria-label={`Move ${name} up`} disabled={index === 0} onClick={() => onMove(index, -1)} className="focus-ring grid h-11 w-11 place-items-center rounded-lg hover:bg-ink-100 disabled:opacity-40">
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" aria-label={`Move ${name} down`} disabled={index === total - 1} onClick={() => onMove(index, 1)} className="focus-ring grid h-11 w-11 place-items-center rounded-lg hover:bg-ink-100 disabled:opacity-40">
          <ArrowDown className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" aria-label={`Remove ${name}`} onClick={() => onRemove(entry.id)} className="focus-ring grid h-11 w-11 place-items-center rounded-lg text-danger-600 hover:bg-danger-100">
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export function LookbookEditor({ lookbook, onChange }) {
  const { products, ensureLoaded } = useAdminCatalog();
  const [chosenSlug, setChosenSlug] = useState("");

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const bySlug = useMemo(() => new Map(products.map((product) => [product.slug, product])), [products]);
  const available = products.filter((product) => !lookbook.some((entry) => entry.productSlug === product.slug));
  const atLimit = lookbook.length >= MAX_LOOKBOOK;

  const add = () => {
    if (!chosenSlug) return;
    onChange(withLookbookEntryAdded(lookbook, chosenSlug));
    setChosenSlug("");
  };

  return (
    <div className="space-y-4">
      {lookbook.length > 0 ? (
        <ul className="space-y-3">
          {lookbook.map((entry, index) => (
            <LookbookRow
              key={entry.id}
              entry={entry}
              index={index}
              total={lookbook.length}
              product={bySlug.get(entry.productSlug)}
              onCaption={(id, caption) => onChange(withLookbookCaption(lookbook, id, caption))}
              onMove={(position, offset) => onChange(withLookbookEntryMoved(lookbook, position, offset))}
              onRemove={(id) => onChange(withoutLookbookEntry(lookbook, id))}
            />
          ))}
        </ul>
      ) : (
        <p className="text-base text-ink-600">Nothing picked yet. The "Shop the look" section stays hidden until you add something.</p>
      )}
      {atLimit ? (
        <p className="text-sm font-medium text-ink-600">You have picked the maximum of {MAX_LOOKBOOK}.</p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="Add a product" className="flex-1">
            <Select value={chosenSlug} onChange={(event) => setChosenSlug(event.target.value)}>
              <option value="">Choose a product</option>
              {available.map((product) => <option key={product.id} value={product.slug}>{product.name}</option>)}
            </Select>
          </Field>
          <Button variant="secondary" onClick={add} disabled={!chosenSlug}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
