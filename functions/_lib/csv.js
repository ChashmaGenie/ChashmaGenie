const FORMULA_PREFIX = /^[=+\-@\t\r]/;

const PLAIN_NUMBER = /^[+-]?\d+(\.\d+)?$/;

const neutralizeFormula = (text) => (FORMULA_PREFIX.test(text) && !PLAIN_NUMBER.test(text) ? `'${text}` : text);

const quoteCell = (value) => `"${neutralizeFormula(String(value ?? "")).replace(/"/g, '""')}"`;

export const toCsv = (header, rows) =>
  [header, ...rows].map((row) => row.map(quoteCell).join(",")).join("\r\n") + "\r\n";

const EYE_LABELS = [["sph", "SPH"], ["cyl", "CYL"], ["axis", "AXIS"], ["add", "ADD"]];

const eyeText = (eye) =>
  EYE_LABELS.filter(([key]) => eye?.[key] !== null && eye?.[key] !== undefined)
    .map(([key, label]) => `${label} ${eye[key]}`)
    .join(", ");

const pdText = (rx) => {
  if (!rx?.pd) return rx?.pdMode ?? "";
  if (rx.pd.single !== undefined) return String(rx.pd.single);
  return `${rx.pd.right ?? ""} / ${rx.pd.left ?? ""}`;
};

const itemsText = (items) =>
  items.map((item) => [item.productName, item.colorKey, item.note].filter(Boolean).join(" ")).join("; ");

export const QUOTE_CSV_HEADER = [
  "Ref", "Created", "Status", "Name", "Phone", "City", "Channel", "Email", "Frames", "Frame total (Rs)", "Usage",
  "Lens package", "Prescription", "Right eye", "Left eye", "PD",
  "Customer notes", "Owner notes", "Source", "Medium", "Campaign",
];

export const quoteCsvRow = (quote) => [
  quote.id, quote.createdAt, quote.status, quote.contact.name, quote.contact.phone, quote.contact.city,
  quote.contact.channel, quote.contact.email, itemsText(quote.items), quote.estimatedFramePrice, quote.usage,
  quote.lensPackage?.name ?? "To be suggested", quote.rx?.mode ?? "none", eyeText(quote.rx?.right),
  eyeText(quote.rx?.left), pdText(quote.rx), quote.contact.notes, quote.ownerNotes, quote.attribution?.source,
  quote.attribution?.medium, quote.attribution?.campaign,
];

export const NOTIFY_CSV_HEADER = ["Contact", "Type", "Signed up"];

export const notifyCsvRow = (entry) => [entry.contact, entry.kind, entry.createdAt];

export const csvResponse = (body, filename, extraHeaders = {}) =>
  new Response(`﻿${body}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
