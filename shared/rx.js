import { CONTACT_CHANNELS, LENS_INDEXES, isOneOf, labelOf } from "./enums.js";

const PK_MOBILE_LOCAL = /^3\d{9}$/;
const PHONE_CHARACTERS = /^[\d\s\-()+]+$/;
const NAME_PATTERN = /^(?=.*\p{L})[\p{L}\p{M}\s.'-]{2,60}$/u;
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const WHOLE_NUMBER_PATTERN = /^\d{1,3}$/;
const MILLIMETRE_PATTERN = /^\d{1,3}(?:[.,]\d{1,2})?$/;
const EMAIL_MAX_LENGTH = 120;
const DIOPTER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)$/;
const PLANO_WORDS = ["plano", "pl", "ds", "0"];
const EPSILON = 1e-9;
const INDEX_TIERS = ["1.50", "1.59", "1.61", "1.67", "1.74"];
const SIDES = ["right", "left"];
const SIDE_LABELS = { right: "Right eye", left: "Left eye" };

const SPH_LIMITS = { min: -20, max: 12 };
const CYL_LIMITS = { min: -6, max: 6 };
const ADD_LIMITS = { min: 0.75, max: 4 };

export const isValidEmail = (input) =>
  typeof input === "string" && input.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(input);

const quarterList = (min, max) => Array.from({ length: (max - min) * 4 + 1 }, (_, step) => min + step / 4);
const minusQuarters = (limit) => quarterList(-limit, -0.25).reverse();
const plusQuarters = (limit) => quarterList(0.25, limit);

export const SPH_VALUES = [0, ...minusQuarters(-SPH_LIMITS.min), ...plusQuarters(SPH_LIMITS.max)];
export const CYL_MINUS_VALUES = [0, ...minusQuarters(6)];
export const CYL_PLUS_VALUES = [0, ...plusQuarters(6)];
export const CYL_VALUES = [0, ...minusQuarters(6), ...plusQuarters(6)];
export const ADD_VALUES = quarterList(ADD_LIMITS.min, ADD_LIMITS.max);

const isBlank = (input) => input === null || input === undefined || String(input).trim() === "";

export const parseDiopter = (input) => {
  if (typeof input !== "number" && typeof input !== "string") return NaN;
  if (typeof input === "number") return Number.isFinite(input) ? input : NaN;
  const text = String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/[−–]/g, "-")
    .replace(/\s+/g, "")
    .replace(",", ".");
  if (PLANO_WORDS.includes(text)) return 0;
  const numeric = text.replace(/d$/, "");
  return DIOPTER_PATTERN.test(numeric) ? Number(numeric) : NaN;
};

export const roundToQuarter = (value) => {
  const units = Math.sign(value) * Math.round(Math.abs(value) * 4);
  return units === 0 ? 0 : units / 4;
};

export const formatDiopter = (value) => {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "0.00";
  return `${value > 0 ? "+" : "-"}${Math.abs(value).toFixed(2)}`;
};

export const transposeToMinus = ({ sph, cyl, axis }) => {
  if (!(cyl > 0)) return { sph, cyl, axis };
  return { sph: sph + cyl, cyl: -cyl, axis: axis <= 90 ? axis + 90 : axis - 90 };
};

export const strongestMeridian = ({ sph, cyl = 0 }) => Math.max(Math.abs(sph), Math.abs(sph + cyl));

const collectErrors = (fields) =>
  Object.fromEntries(Object.entries(fields).filter(([, field]) => field.error).map(([key, field]) => [key, field.error]));

const collectWarnings = (fields) => Object.values(fields).map((field) => field.warning).filter(Boolean);

const readDiopterField = (raw, { label, min, max, required }) => {
  if (isBlank(raw)) return required ? { error: `${label} is required.` } : { value: null };
  const parsed = parseDiopter(raw);
  if (Number.isNaN(parsed)) return { error: `${label} must be a number like -1.25 or +0.50.` };
  const rounded = roundToQuarter(parsed);
  if (rounded < min || rounded > max) {
    return { error: `${label} must be between ${formatDiopter(min)} and ${formatDiopter(max)}.` };
  }
  const wasRounded = Math.abs(rounded - parsed) > EPSILON;
  return { value: rounded, warning: wasRounded ? `${label} rounded to ${formatDiopter(rounded)}.` : null };
};

const plainText = (raw) => (typeof raw === "string" || typeof raw === "number" ? String(raw).trim() : "");

const readAdd = (raw, needsAdd) => {
  if (needsAdd) return readDiopterField(raw, { label: "ADD", required: true, ...ADD_LIMITS });
  const optional = isBlank(raw) ? { value: null } : readDiopterField(raw, { label: "ADD", required: false, ...ADD_LIMITS });
  return optional.error ? { value: null } : optional;
};

const readAxis = (raw) => {
  if (isBlank(raw)) return { error: "AXIS is required when you have a CYL value." };
  const text = plainText(raw);
  const axis = WHOLE_NUMBER_PATTERN.test(text) ? Number(text) : NaN;
  if (!Number.isInteger(axis) || axis > 180) return { error: "AXIS must be a whole number from 0 to 180." };
  return { value: axis === 0 ? 180 : axis };
};

const powerWarning = (field, label, limit, message) =>
  field.value !== null && field.value !== undefined && Math.abs(field.value) > limit ? message(label) : null;

export const validateEye = (eye, { needsAdd = false } = {}) => {
  const input = eye ?? {};
  const sph = readDiopterField(input.sph, { label: "SPH", required: true, ...SPH_LIMITS });
  const cyl = readDiopterField(input.cyl, { label: "CYL", required: false, ...CYL_LIMITS });
  const cylValue = cyl.value ?? 0;
  const axis = cylValue === 0 ? { value: null } : readAxis(input.axis);
  const add = readAdd(input.add, needsAdd);
  const fields = { sph, cyl, axis, add };
  const powerWarnings = [
    powerWarning(sph, "SPH", 10, () => "High SPH power: we will confirm lens availability with you."),
    powerWarning(cyl, "CYL", 4, () => "High CYL power: we will confirm lens availability with you."),
  ].filter(Boolean);
  return {
    errors: collectErrors(fields),
    warnings: [...collectWarnings(fields), ...powerWarnings],
    value: { sph: sph.value ?? null, cyl: cylValue, axis: axis.value ?? null, add: add.value ?? null },
  };
};

const readMillimetres = (raw, label, min, max) => {
  if (isBlank(raw)) return { error: `${label} is required.` };
  const text = plainText(raw);
  const parsed = MILLIMETRE_PATTERN.test(text) ? Number(text.replace(",", ".")) : NaN;
  if (!Number.isFinite(parsed)) return { error: `${label} must be a number in mm.` };
  if (parsed < min || parsed > max) return { error: `${label} must be between ${min} and ${max} mm.` };
  return { value: Math.round(parsed * 10) / 10 };
};

const SINGLE_PD_COMFORT = { adult: [50, 72], kid: [40, 60] };

const validateSinglePd = (single, isKid) => {
  const field = readMillimetres(single, "PD", 40, 80);
  const [low, high] = SINGLE_PD_COMFORT[isKid ? "kid" : "adult"];
  const unusual = field.value !== undefined && (field.value < low || field.value > high);
  return {
    errors: collectErrors({ single: field }),
    warnings: unusual ? ["This PD is unusual, so we will double-check it with you."] : [],
    value: { mode: "single", single: field.value ?? null },
  };
};

const validateDualPd = (right, left) => {
  const rightField = readMillimetres(right, "Right PD", 20, 40);
  const leftField = readMillimetres(left, "Left PD", 20, 40);
  const errors = collectErrors({ right: rightField, left: leftField });
  const bothRead = rightField.value !== undefined && leftField.value !== undefined;
  const total = bothRead ? rightField.value + leftField.value : null;
  const totalError = bothRead && (total < 40 || total > 80) ? { right: "Right and left PD together should be 40 to 80 mm." } : {};
  const asymmetric = bothRead && Math.abs(rightField.value - leftField.value) > 3;
  return {
    errors: { ...errors, ...totalError },
    warnings: asymmetric ? ["Right and left PD differ by more than 3 mm, so we will double-check them with you."] : [],
    value: { mode: "dual", right: rightField.value ?? null, left: leftField.value ?? null },
  };
};

export const validatePd = ({ mode, single, right, left } = {}, { isKid = false } = {}) => {
  if (mode === "unknown") return { errors: {}, warnings: [], value: { mode: "unknown" } };
  if (mode === "single") return validateSinglePd(single, isKid);
  if (mode === "dual") return validateDualPd(right, left);
  return { errors: { mode: "Choose how you want to give your PD." }, warnings: [], value: null };
};

const toNumberOrNull = (raw) => (isBlank(raw) ? null : parseDiopter(raw));

const transposedEyeInput = (eye) => {
  const sph = toNumberOrNull(eye?.sph);
  const cyl = toNumberOrNull(eye?.cyl);
  const axis = toNumberOrNull(eye?.axis);
  const canTranspose = Number.isFinite(sph) && cyl > 0 && Number.isInteger(axis) && axis >= 0 && axis <= 180;
  return canTranspose ? { ...eye, ...transposeToMinus({ sph, cyl, axis: axis === 0 ? 180 : axis }) } : eye;
};

const prefixed = (side, entries) =>
  Object.fromEntries(Object.entries(entries).map(([key, message]) => [`${side}.${key}`, message]));

const sphericalEquivalent = ({ sph, cyl }) => sph + cyl / 2;

const anisometropiaWarning = (right, left) => {
  if (right.sph === null || left.sph === null) return [];
  const gap = Math.abs(sphericalEquivalent(right) - sphericalEquivalent(left));
  return gap > 4 ? ["The two eyes differ by more than 4.00 D, so this may need special ordering."] : [];
};

const plusCylinderError = (value) =>
  value.cyl > 0 ? { cyl: "Tick the box above if your CYL is written with a plus (+)." } : {};

const validateSide = (side, eye, options, usePlus) => {
  const check = validateEye(usePlus ? transposedEyeInput(eye) : eye, options);
  return {
    value: check.value,
    errors: prefixed(side, { ...check.errors, ...plusCylinderError(check.value) }),
    warnings: check.warnings.map((warning) => `${SIDE_LABELS[side]}: ${warning}`),
  };
};

const pdValueToStored = (pd) => {
  if (pd.mode === "single") return { single: pd.single };
  if (pd.mode === "dual") return { right: pd.right, left: pd.left };
  return null;
};

const SEND_LATER_RESULT = { ok: true, errors: {}, warnings: [], value: { mode: "send_later" } };

export const validateRx = (input, { needsAdd = false, isKid = false } = {}) => {
  if (input === null || input === undefined) return { ok: true, errors: {}, warnings: [], value: null };
  if (input.mode === "send_later") return SEND_LATER_RESULT;
  if (input.mode !== "enter") {
    return { ok: false, errors: { mode: "Choose how you want to share your prescription." }, warnings: [], value: null };
  }
  const usePlus = input.cylFormat === "plus";
  const [right, left] = SIDES.map((side) => validateSide(side, input[side], { needsAdd }, usePlus));
  const pd = validatePd({ mode: input.pdMode, ...(input.pd ?? {}) }, { isKid });
  const errors = { ...right.errors, ...left.errors, ...prefixed("pd", pd.errors) };
  const warnings = [...right.warnings, ...left.warnings, ...anisometropiaWarning(right.value, left.value), ...pd.warnings];
  const ok = Object.keys(errors).length === 0;
  const value = ok
    ? { mode: "enter", cylFormat: "minus", right: right.value, left: left.value, pdMode: pd.value.mode, pd: pdValueToStored(pd.value), warnings }
    : null;
  return { ok, errors, warnings, value };
};

const hasHyperopia = (rxValue) => SIDES.some((side) => rxValue[side]?.sph >= 4);

const strongestOverall = (rxValue) =>
  Math.max(...SIDES.filter((side) => rxValue[side]?.sph !== null && rxValue[side]).map((side) => strongestMeridian(rxValue[side])));

const baseTierFor = (strongest) => {
  if (strongest <= 2) return 0;
  if (strongest <= 4) return 1;
  if (strongest <= 5.5) return 2;
  if (strongest <= 8) return 3;
  return 4;
};

const thinnestAllowedTier = (rim) => (rim === "rimless" ? 3 : INDEX_TIERS.length - 1);

const pickTier = (rxValue, rim) => {
  const strongest = strongestOverall(rxValue);
  const bumped = baseTierFor(strongest) + (hasHyperopia(rxValue) ? 1 : 0);
  const framed = rim && rim !== "full_rim" ? Math.max(bumped, 1) : bumped;
  return Math.min(framed, thinnestAllowedTier(rim), INDEX_TIERS.length - 1);
};

const recommendationReason = (strongest, tier, rim) => {
  const name = labelOf(LENS_INDEXES, INDEX_TIERS[tier]);
  const base = `Your strongest power is ${strongest.toFixed(2)}, so ${name} lenses should keep the glasses slim and light.`;
  const rimlessNote = rim === "rimless" && tier === 3 ? " The owner will confirm the final choice for a rimless frame." : "";
  return `${base}${rimlessNote}`;
};

export const recommendIndex = (rxValue, { rim } = {}) => {
  const hasEye = rxValue && SIDES.some((side) => rxValue[side] && rxValue[side].sph !== null);
  if (!hasEye) return { index: null, alternatives: [], reason: "" };
  const tier = pickTier(rxValue, rim);
  const ceiling = thinnestAllowedTier(rim);
  const alternatives = [tier - 1, tier + 1].filter((candidate) => candidate >= 0 && candidate <= ceiling).map((candidate) => INDEX_TIERS[candidate]);
  return { index: INDEX_TIERS[tier], alternatives, reason: recommendationReason(strongestOverall(rxValue), tier, rim) };
};

const summarizeEye = (eye) => {
  if (!eye || eye.sph === null) return "";
  const parts = [`SPH ${formatDiopter(eye.sph)}`];
  if (eye.cyl) parts.push(`CYL ${formatDiopter(eye.cyl)}`, `AXIS ${eye.axis}`);
  if (eye.add) parts.push(`ADD ${formatDiopter(eye.add)}`);
  return parts.join(" ");
};

const summarizePd = (rxValue) => {
  if (rxValue.pdMode === "single" && rxValue.pd) return `PD ${rxValue.pd.single} mm`;
  if (rxValue.pdMode === "dual" && rxValue.pd) return `PD R ${rxValue.pd.right} / L ${rxValue.pd.left} mm`;
  return "PD not known";
};

export const summarizeRx = (rxValue) => {
  if (!rxValue || rxValue.mode !== "enter") return null;
  return { right: summarizeEye(rxValue.right), left: summarizeEye(rxValue.left), pd: summarizePd(rxValue) };
};

const withoutCountryPrefix = (digits) => {
  if (digits.startsWith("0092")) return digits.slice(4);
  if (digits.startsWith("92")) return digits.slice(2);
  return digits;
};

const withoutTrunkZero = (digits) => (digits.startsWith("0") ? digits.slice(1) : digits);

export const normalizePkPhone = (input) => {
  const text = typeof input === "string" ? input.trim() : "";
  if (!PHONE_CHARACTERS.test(text)) return null;
  const local = withoutTrunkZero(withoutCountryPrefix(text.replace(/\D/g, "")));
  return PK_MOBILE_LOCAL.test(local) ? `92${local}` : null;
};

export const isValidPkPhone = (input) => normalizePkPhone(input) !== null;

export const formatPkPhone = (input) => {
  const normalized = normalizePkPhone(input);
  if (!normalized) return "";
  const local = normalized.slice(2);
  return `0${local.slice(0, 3)}-${local.slice(3)}`;
};

const contactFieldErrors = ({ name, phone, city, email, notes, channel }) => [
  ["name", NAME_PATTERN.test(name), "Please enter your name."],
  ["phone", Boolean(phone), "Please enter a valid Pakistani mobile number."],
  ["city", city.length >= 2 && city.length <= 40, "Please enter your city."],
  ["email", !email || isValidEmail(email), "That email does not look right."],
  ["email", channel !== "email" || Boolean(email), "Add your email so we can reach you there."],
  ["notes", notes.length <= 500, "Notes can be up to 500 characters."],
];

export const validateContact = (contact) => {
  const input = contact ?? {};
  const fields = {
    name: String(input.name ?? "").trim().replace(/\s+/g, " "),
    phone: normalizePkPhone(input.phone),
    city: String(input.city ?? "").trim(),
    email: String(input.email ?? "").trim(),
    notes: String(input.notes ?? "").trim(),
    channel: isOneOf(CONTACT_CHANNELS, input.channel) ? input.channel : "whatsapp",
  };
  const failures = contactFieldErrors(fields).filter(([, valid]) => !valid);
  const errors = Object.fromEntries([...failures].reverse().map(([key, , message]) => [key, message]));
  if (input.consent !== true) errors.consent = "Please confirm to continue.";
  return { ok: Object.keys(errors).length === 0, errors, value: fields };
};
