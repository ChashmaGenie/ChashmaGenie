import { COLORS, CONTACT_CHANNELS, LENS_INDEXES, LENS_TREATMENTS, LENS_TYPES, USAGE, labelOf } from "@shared/enums.js";
import { formatPkPhone } from "@shared/rx.js";
import { formatPkr } from "@/lib/format.js";

const SPH_WARNING_LIMIT = 10;
const CYL_WARNING_LIMIT = 4;
const ANISOMETROPIA_LIMIT = 4;
const SINGLE_PD_RANGE = [50, 72];
const DUAL_PD_ASYMMETRY_LIMIT = 3;
const EYE_ROWS = [
  { key: "right", label: "Right (OD)" },
  { key: "left", label: "Left (OS)" },
];

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

export const formatDiopter = (value) => {
  if (!isNumber(value)) return "-";
  if (value === 0) return "0.00 / Plano";
  return `${value > 0 ? "+" : "-"}${Math.abs(value).toFixed(2)}`;
};

const formatAxis = (value) => (isNumber(value) && value > 0 ? `${value}°` : "-");

export const rxRows = (rx) =>
  EYE_ROWS.map(({ key, label }) => {
    const eye = rx?.[key] ?? {};
    return { key, label, sph: formatDiopter(eye.sph), cyl: formatDiopter(eye.cyl), axis: formatAxis(eye.axis), add: formatDiopter(eye.add) };
  });

export const formatPd = (rx) => {
  if (rx?.pdMode === "single" && isNumber(rx.pd?.single)) return `${rx.pd.single} mm (one number)`;
  if (rx?.pdMode === "dual" && isNumber(rx.pd?.right) && isNumber(rx.pd?.left)) return `Right ${rx.pd.right} mm, left ${rx.pd.left} mm`;
  return "Not given. Please help the customer measure it.";
};

const eyeFlags = ({ key, label }, rx) => {
  const eye = rx[key] ?? {};
  const flags = [];
  if (isNumber(eye.sph) && Math.abs(eye.sph) > SPH_WARNING_LIMIT) flags.push(`${label}: high power (${formatDiopter(eye.sph)})`);
  if (isNumber(eye.cyl) && Math.abs(eye.cyl) > CYL_WARNING_LIMIT) flags.push(`${label}: high cylinder (${formatDiopter(eye.cyl)})`);
  return flags;
};

const anisometropiaFlags = (rx) => {
  const { right, left } = rx;
  if (!isNumber(right?.sph) || !isNumber(left?.sph)) return [];
  const gap = Math.abs(right.sph - left.sph);
  return gap > ANISOMETROPIA_LIMIT ? [`Big difference between the eyes (${gap.toFixed(2)} D)`] : [];
};

const pdFlags = (rx) => {
  if (rx.pdMode === "single" && isNumber(rx.pd?.single)) {
    const [min, max] = SINGLE_PD_RANGE;
    return rx.pd.single < min || rx.pd.single > max ? [`PD of ${rx.pd.single} mm looks unusual. Please double-check.`] : [];
  }
  if (rx.pdMode === "dual" && isNumber(rx.pd?.right) && isNumber(rx.pd?.left)) {
    return Math.abs(rx.pd.right - rx.pd.left) > DUAL_PD_ASYMMETRY_LIMIT ? ["The two PD numbers are very different. Please double-check."] : [];
  }
  return [];
};

export const rxFlags = (rx) => {
  if (!rx || rx.mode !== "enter") return [];
  return [...EYE_ROWS.flatMap((row) => eyeFlags(row, rx)), ...anisometropiaFlags(rx), ...pdFlags(rx), ...(rx.warnings ?? [])];
};

export const rxStatusNote = (rx) => {
  if (!rx) return "No prescription. The customer wants non-prescription glasses.";
  if (rx.mode === "send_later") return "The customer will send the prescription later on WhatsApp or email.";
  return null;
};

export const phoneDisplay = (phone) => formatPkPhone(phone) || phone || "";

export const quoteDate = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};

export const attributionLine = (attribution) => {
  const parts = [attribution?.source, attribution?.medium].filter(Boolean);
  if (parts.length > 0) return parts.join(" / ");
  return attribution?.referrer || "Direct visit";
};

export const itemLine = (item) => {
  if (item.ownFrame) return "Own frame (lenses only)";
  const colour = item.colorKey ? labelOf(COLORS, item.colorKey) || item.colorKey : "";
  return [item.productName, colour].filter(Boolean).join(", ");
};

export const lensLine = (lensPackage) => {
  if (!lensPackage) return "Not sure. Customer wants a suggestion.";
  const details = [
    labelOf(LENS_TYPES, lensPackage.lensType),
    labelOf(LENS_INDEXES, lensPackage.index),
    labelOf(LENS_TREATMENTS, lensPackage.treatment),
  ].filter(Boolean);
  return [lensPackage.name, details.join(", ")].filter(Boolean).join(" - ");
};

export const usageLabel = (usage) => labelOf(USAGE, usage) || usage || "";

export const channelLabel = (channel) => labelOf(CONTACT_CHANNELS, channel) || channel || "";

export const searchableQuoteText = (entry) =>
  [entry.id, entry.name, entry.phone, entry.city, entry.itemSummary].filter(Boolean).join(" ").toLowerCase();

export const filterQuotes = (quotes, status, query) => {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return quotes.filter((entry) => (status === "all" || entry.status === status) && terms.every((term) => searchableQuoteText(entry).includes(term)));
};

export const whatsappGreeting = (quote) =>
  `Assalam o Alaikum ${quote.contact?.name ?? ""}, thank you for your quote request ${quote.id} at ChashmaGenie. `.replace(/\s+,/, ",");

export const rxPlainText = (quote) => {
  const rx = quote.rx;
  const lines = [`Quote ${quote.id} - ${quote.contact?.name ?? ""}`];
  const note = rxStatusNote(rx);
  if (note) return [...lines, note].join("\n");
  rxRows(rx).forEach((row) => lines.push(`${row.label}: SPH ${row.sph}, CYL ${row.cyl}, AXIS ${row.axis}, ADD ${row.add}`));
  lines.push(`PD: ${formatPd(rx)}`);
  return lines.join("\n");
};

export const framesTotal = (items) => formatPkr(items.reduce((sum, item) => sum + (item.ownFrame ? 0 : item.framePrice || 0), 0));
