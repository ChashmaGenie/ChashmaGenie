import { COLORS, USAGE, labelOf } from "@shared/enums.js";
import { normalizePkPhone } from "@shared/rx.js";

const MAX_URL_LENGTH = 1800;
const NOTES_FALLBACK_LENGTH = 80;

export const waLink = (number, text = "") => {
  const digits = normalizePkPhone(number);
  if (!digits) return "";
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
};

const signed = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  if (number === 0) return "0.00";
  return `${number > 0 ? "+" : "-"}${Math.abs(number).toFixed(2)}`;
};

const describeEye = (eye) => {
  if (!eye) return "";
  const parts = [`SPH ${signed(eye.sph)}`];
  if (eye.cyl) parts.push(`CYL ${signed(eye.cyl)}`, `AXIS ${eye.axis}`);
  if (eye.add) parts.push(`ADD ${signed(eye.add)}`);
  return parts.join(" ");
};

const describePd = (rx) => {
  if (!rx?.pd) return "";
  if (rx.pd.single) return `PD ${rx.pd.single}`;
  if (rx.pd.right && rx.pd.left) return `PD ${rx.pd.right}/${rx.pd.left}`;
  return "";
};

const describePrescription = (rx) => {
  if (!rx || rx.mode !== "enter") return "I will send it here";
  const pieces = [`Right ${describeEye(rx.right)}`, `Left ${describeEye(rx.left)}`, describePd(rx)];
  return pieces.filter(Boolean).join(" | ");
};

const describeFrame = (item) => {
  if (item.ownFrame) return "Own frame / lenses only";
  const details = [item.colorKey ? labelOf(COLORS, item.colorKey) : "", item.size].filter(Boolean);
  return details.length > 0 ? `${item.productName} (${details.join(", ")})` : item.productName;
};

const describeSource = (attribution) => {
  if (!attribution) return "";
  return [attribution.source, attribution.medium, attribution.campaign].filter(Boolean).join("/");
};

const describeLens = (lensPackage) => (lensPackage?.name ? lensPackage.name : "Please suggest");

const messageLines = (quote, siteUrl) => {
  const items = quote.items ?? [];
  const source = describeSource(quote.attribution);
  return [
    "Assalam o Alaikum! I'd like a quote.",
    `Ref: ${quote.id}`,
    ...items.map((item) => `Frame: ${describeFrame(item)}`),
    quote.usage ? `Usage: ${labelOf(USAGE, quote.usage)}` : "",
    `Lens: ${describeLens(quote.lensPackage)}`,
    `Prescription: ${describePrescription(quote.rx)}`,
    quote.contact?.name ? `Name: ${quote.contact.name}` : "",
    quote.contact?.city ? `City: ${quote.contact.city}` : "",
    quote.contact?.notes ? `Notes: ${quote.contact.notes}` : "",
    source ? `Source: ${source}` : "",
    siteUrl ? `Site: ${siteUrl}` : "",
  ].filter(Boolean);
};

const encodedLength = (lines) => encodeURIComponent(lines.join("\n")).length;

const shortenNotes = (lines) =>
  lines.map((line) => (line.startsWith("Notes: ") ? `${line.slice(0, NOTES_FALLBACK_LENGTH)}...` : line));

const dropNotes = (lines) => lines.filter((line) => !line.startsWith("Notes: "));

export const buildQuoteMessage = (quote, siteUrl = "") => {
  const lines = messageLines(quote, siteUrl);
  const fitting = [lines, shortenNotes(lines), dropNotes(lines)].find((candidate) => encodedLength(candidate) < MAX_URL_LENGTH);
  return (fitting ?? dropNotes(lines)).join("\n");
};
