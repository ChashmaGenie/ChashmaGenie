import { Link } from "react-router-dom";
import {
  COATINGS, FEATURES, GENDERS, LENS_INDEXES, LENS_TREATMENTS, LENS_TYPES, MATERIALS, RIM_TYPES, SHAPES, SIZE_LABELS,
  deriveSizeLabel, labelOf,
} from "@shared/enums.js";
import { Accordion, AccordionItem } from "@/components/ui/index.js";
import { formatPkr } from "@/lib/format.js";
import { FitDiagram } from "./FitDiagram.jsx";

const listLabels = (list, values) => values.map((value) => labelOf(list, value)).join(", ");

const frameFacts = (product) => [
  ["Material", labelOf(MATERIALS, product.material)],
  ["Frame type", labelOf(RIM_TYPES, product.rim)],
  ["Shape", labelOf(SHAPES, product.shape)],
  ["For", labelOf(GENDERS, product.gender)],
  ["Features", listLabels(FEATURES, product.features)],
  ["Product code", product.sku ?? ""],
];

const lensFacts = (product) => [
  ["Lens type", labelOf(LENS_TYPES, product.lens?.lensType)],
  ["Index", labelOf(LENS_INDEXES, product.lens?.index)],
  ["Treatment", labelOf(LENS_TREATMENTS, product.lens?.treatment)],
  ["Included coatings", listLabels(COATINGS, product.lens?.coatings ?? [])],
  ["Notes", product.lens?.note ?? ""],
  ["Starting add-on price", formatPkr(product.price)],
];

function Facts({ rows }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
      {rows.filter(([, value]) => value).map(([term, value]) => (
        <div key={term} className="contents">
          <dt className="font-semibold text-ink-900">{term}</dt>
          <dd className="text-ink-800">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SizeTable({ sizes }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[320px] border-collapse text-start text-sm">
        <caption className="mb-2 text-start font-semibold text-ink-900">Measurements in millimetres</caption>
        <thead>
          <tr className="border-b border-ink-300 text-ink-600">
            {["Size", "Lens width", "Bridge", "Temple", "Fit"].map((heading) => <th key={heading} scope="col" className="py-2 pe-3 text-start font-semibold">{heading}</th>)}
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => (
            <tr key={`${size.lens}-${size.bridge}-${size.temple}`} className="border-b border-ink-200">
              <th scope="row" className="tabular py-2 pe-3 text-start font-semibold">{size.lens}-{size.bridge}-{size.temple}</th>
              <td className="tabular py-2 pe-3">{size.lens}</td>
              <td className="tabular py-2 pe-3">{size.bridge}</td>
              <td className="tabular py-2 pe-3">{size.temple}</td>
              <td className="py-2 pe-3">{labelOf(SIZE_LABELS, deriveSizeLabel(size.lens))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailsPanel({ product }) {
  const isLens = product.category === "lenses";
  return (
    <div className="flex flex-col gap-4">
      {product.description ? <p dir="auto" className="text-ink-800">{product.description}</p> : null}
      {product.descriptionUr ? <p dir="rtl" lang="ur" className="text-ink-800">{product.descriptionUr}</p> : null}
      <Facts rows={isLens ? lensFacts(product) : frameFacts(product)} />
      {isLens ? null : <SizeTable sizes={product.sizes} />}
    </div>
  );
}

function FitPanel({ product }) {
  return (
    <div className="flex flex-col gap-4">
      <FitDiagram size={product.sizes[0]} />
      <p>
        Look on the inside of the temple arm of a pair that fits you well. You will see three numbers such as <strong className="tabular">52-18-140</strong>. They are the lens width, the bridge width and the temple length, in millimetres.
      </p>
      <p>Choose a frame with numbers close to your current pair. If you are between sizes, ask us on WhatsApp and send a photo.</p>
    </div>
  );
}

const rxNotes = (product) => [
  product.rxCompatible
    ? "This frame can be fitted with prescription lenses."
    : "This style is usually sold with non-prescription lenses. Ask us if you need power lenses in it.",
  product.multifocalOk ? "It works with progressive and bifocal lenses." : "It is best with single vision lenses.",
];

function PrescriptionPanel({ product }) {
  return (
    <div className="flex flex-col gap-3">
      {product.category === "lenses" ? null : rxNotes(product).map((note) => <p key={note}>{note}</p>)}
      <p>Add your prescription in our quote form. Lens details are confirmed with you before anything is ordered.</p>
      <p><Link to="/faq#lenses" className="text-sky-700 underline">Read our lens guide</Link></p>
    </div>
  );
}

function PolicyPanel({ settings }) {
  const lines = [settings.shippingText, settings.codText, settings.returnsText, settings.warrantyText].filter(Boolean);
  return (
    <div className="flex flex-col gap-3">
      {lines.map((line) => <p key={line}>{line}</p>)}
      <p><Link to="/shipping-returns" className="text-sky-700 underline">Full shipping and returns details</Link></p>
    </div>
  );
}

export function ProductAccordions({ product, settings }) {
  const isLens = product.category === "lenses";
  return (
    <Accordion>
      <AccordionItem title="Details" defaultOpen><DetailsPanel product={product} /></AccordionItem>
      {isLens ? null : <AccordionItem title="Fit and measurements"><FitPanel product={product} /></AccordionItem>}
      <AccordionItem title="Shipping and returns"><PolicyPanel settings={settings} /></AccordionItem>
      <AccordionItem title="Prescription lenses"><PrescriptionPanel product={product} /></AccordionItem>
    </Accordion>
  );
}
