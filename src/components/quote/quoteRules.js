import { COATINGS, COLORS, TINT_COLORS, USAGE, labelOf } from "@shared/enums.js";
import { recommendIndex, summarizeRx, validateContact, validateRx } from "@shared/rx.js";
import { getAttribution } from "@/lib/utm.js";

export const STEP_LABELS = ["Frame", "Usage", "Lenses", "Prescription", "Your details", "Review"];
export const STEP = { frame: 0, usage: 1, lens: 2, rx: 3, contact: 4, review: 5 };

const MULTIFOCAL_TYPES = ["progressive", "bifocal"];
const TINTED_TREATMENTS = ["tint_solid", "tint_gradient"];
const SUN_TREATMENTS = [...TINTED_TREATMENTS, "polarized", "photochromic"];
const MIN_NOTE_LENGTH = { own: 3, undecided: 5 };

export const isFrameProduct = (product) => product.category !== "lenses";

export const sizeText = (size) => (size ? `${size.lens}-${size.bridge}-${size.temple}` : "");

export const effectiveColor = (item, product) =>
  product.colors.includes(item.colorKey) ? item.colorKey : product.colors[0] ?? "";

export const effectiveSizeIndex = (item, product) =>
  Number.isInteger(item.sizeIndex) && item.sizeIndex >= 0 && item.sizeIndex < product.sizes.length ? item.sizeIndex : 0;

export const resolveFrames = (state, bySlug) =>
  state.frameMode !== "choose"
    ? []
    : state.items
        .map((item) => ({ item, product: bySlug(item.slug) }))
        .filter(({ product }) => product !== null)
        .map(({ item, product }) => ({
          item,
          product,
          colorKey: effectiveColor(item, product),
          sizeIndex: effectiveSizeIndex(item, product),
        }));

export const unavailableSlugs = (state, bySlug) =>
  state.frameMode === "choose" ? state.items.filter((item) => bySlug(item.slug) === null).map((item) => item.slug) : [];

export const lensProductOf = (state, bySlug) => (state.lensChoice === "package" ? bySlug(state.lensSlug) : null);

export const needsAdd = (lens) => MULTIFOCAL_TYPES.includes(lens?.lens?.lensType);

export const showsTintPicker = (lens) =>
  Boolean(lens) && [...TINTED_TREATMENTS, "polarized"].includes(lens.lens?.treatment);

export const requiresTint = (lens) => TINTED_TREATMENTS.includes(lens?.lens?.treatment);

export const optionalCoatings = (lens) =>
  COATINGS.filter((coating) => !coating.included && !(lens?.lens?.coatings ?? []).includes(coating.value));

export const includedCoatingLabels = (lens) =>
  (lens?.lens?.coatings ?? []).map((value) => labelOf(COATINGS, value)).filter(Boolean);

export const eligibleLenses = (lenses, frames) => {
  const blocksMultifocal = frames.some(({ product }) => !product.multifocalOk);
  const isBlocked = (lens) => blocksMultifocal && MULTIFOCAL_TYPES.includes(lens.lens?.lensType);
  return { eligible: lenses.filter((lens) => !isBlocked(lens)), hiddenCount: lenses.filter(isBlocked).length };
};

const usageScore = (usage, lens) => {
  const treatment = lens.lens?.treatment;
  const hasBlueLight = treatment === "blue_light" || (lens.lens?.coatings ?? []).includes("blue_light_filter");
  if (usage === "computer") return hasBlueLight ? 1 : 0;
  if (usage === "sunglasses_only") return SUN_TREATMENTS.includes(treatment) ? 1 : 0;
  if (usage === "reading") return lens.lens?.lensType === "single_vision" ? 1 : 0;
  return 0;
};

export const sortLensesForUsage = (lenses, usage) =>
  lenses
    .map((lens, position) => ({ lens, position, score: usageScore(usage, lens) }))
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .map(({ lens, score }) => ({ lens, suggested: score > 0 }));

export const buildRxInput = (state) => ({
  mode: "enter",
  cylFormat: state.cylFormat,
  right: state.right,
  left: state.left,
  pdMode: state.pdMode,
  pd: state.pd,
});

const rxOptions = (state, lens) => ({ needsAdd: needsAdd(lens), isKid: state.usage === "kids_school" });

export const checkRx = (state, lens) => validateRx(buildRxInput(state), rxOptions(state, lens));

const rimOf = (frames) => {
  const rims = frames.map(({ product }) => product.rim);
  if (rims.includes("rimless")) return "rimless";
  return rims.includes("half_rim") ? "half_rim" : rims[0];
};

export const rxRecommendation = (state, frames, lens) => {
  if (state.rxChoice !== "enter") return null;
  const check = checkRx(state, lens);
  if (!check.ok) return null;
  const recommendation = recommendIndex(check.value, { rim: rimOf(frames) });
  return recommendation.index ? recommendation : null;
};

const sum = (numbers) => numbers.reduce((total, value) => total + value, 0);

export const estimatePrice = (state, frames, lens, eligible) => {
  const framesTotal = sum(frames.map(({ product }) => product.price));
  const base = { hasFrames: frames.length > 0, lensPending: false, low: framesTotal, high: framesTotal };
  if (lens) return { ...base, low: framesTotal + lens.price, high: framesTotal + lens.price };
  if (state.lensChoice !== "suggest") return { ...base, lensPending: true };
  const prices = eligible.map((entry) => entry.price).filter((price) => price > 0);
  if (prices.length === 0) return { ...base, lensPending: true };
  return { ...base, low: framesTotal + Math.min(...prices), high: framesTotal + Math.max(...prices) };
};

const frameStepErrors = (state, ctx) => {
  if (state.frameMode === "choose") {
    if (state.items.length === 0) return { frames: "Choose at least one frame, or pick another option above." };
    const hasMissing = unavailableSlugs(state, ctx.bySlug).length > 0;
    return ctx.catalogReady && hasMissing ? { frames: "One of your frames is no longer available. Please remove it." } : {};
  }
  const minimum = MIN_NOTE_LENGTH[state.frameMode];
  return state.frameNote.trim().length >= minimum ? {} : { frameNote: "Please tell us a little about the frame." };
};

const lensStepErrors = (state, ctx) => {
  if (state.lensChoice === null) return { lens: "Choose a lens package, or ask us to suggest one." };
  const lens = lensProductOf(state, ctx.bySlug);
  if (state.lensChoice === "package" && !lens && ctx.catalogReady) return { lens: "That lens package is no longer available." };
  return requiresTint(lens) && !state.tintColor ? { tintColor: "Choose a tint colour." } : {};
};

const rxStepErrors = (state, ctx) => {
  if (state.rxChoice === null) return { rxChoice: "Choose how you will share your prescription." };
  if (state.rxChoice !== "enter") return {};
  return checkRx(state, lensProductOf(state, ctx.bySlug)).errors;
};

const contactStepErrors = (state) => validateContact({ ...state.contact, consent: state.consent }).errors;

export const validateStep = (step, state, ctx) => {
  switch (step) {
    case STEP.frame:
      return frameStepErrors(state, ctx);
    case STEP.usage:
      return state.usage ? {} : { usage: "Choose how you will use your glasses." };
    case STEP.lens:
      return lensStepErrors(state, ctx);
    case STEP.rx:
      return rxStepErrors(state, ctx);
    case STEP.contact:
      return contactStepErrors(state);
    default:
      return {};
  }
};

export const firstInvalidStep = (state, ctx) =>
  [STEP.frame, STEP.usage, STEP.lens, STEP.rx, STEP.contact].find(
    (step) => Object.keys(validateStep(step, state, ctx)).length > 0,
  ) ?? null;

export const stepForErrorPath = (path) => {
  if (path.startsWith("items")) return STEP.frame;
  if (path === "usage") return STEP.usage;
  if (["lensPackageId", "tintColor", "extras"].includes(path)) return STEP.lens;
  if (path.startsWith("rx")) return STEP.rx;
  return STEP.contact;
};

const frameItemsPayload = (state, frames) => {
  if (state.frameMode === "choose") {
    return frames.map(({ item, product, colorKey, sizeIndex }) => ({
      slug: item.slug,
      colorKey,
      sizeIndex: product.sizes.length > 0 ? sizeIndex : null,
      ownFrame: false,
      note: "",
    }));
  }
  return [{ slug: "", colorKey: "", sizeIndex: null, ownFrame: state.frameMode === "own", note: state.frameNote.trim() }];
};

const rxPayload = (state, lens) => {
  if (state.rxChoice === "send_later") return { mode: "send_later" };
  if (state.rxChoice !== "enter") return null;
  return checkRx(state, lens).value;
};

const extrasPayload = (state, lens) => {
  const allowed = optionalCoatings(lens).map((coating) => coating.value);
  return state.extras.filter((extra) => allowed.includes(extra));
};

export const buildPayload = (state, bySlug) => {
  const frames = resolveFrames(state, bySlug);
  const lens = lensProductOf(state, bySlug);
  const { name, phone, city, channel, email, notes } = state.contact;
  return {
    items: frameItemsPayload(state, frames),
    usage: state.usage,
    lensPackageId: lens ? lens.id : null,
    extras: extrasPayload(state, lens),
    tintColor: showsTintPicker(lens) ? state.tintColor : null,
    rx: rxPayload(state, lens),
    contact: { name, phone, city, channel, email, notes },
    consent: state.consent,
    attribution: getAttribution(),
    website: state.website,
  };
};

const describeFrame = ({ product, colorKey, sizeIndex }) => ({
  slug: product.slug,
  name: product.name,
  image: product.images[0],
  price: product.price,
  colorLabel: labelOf(COLORS, colorKey),
  sizeText: sizeText(product.sizes[sizeIndex]),
});

const lensDescription = (state, lens) => {
  if (lens) return { name: lens.name, detail: includedCoatingLabels(lens).join(", ") };
  return state.lensChoice === "suggest" ? { name: "Please suggest for me", detail: "The owner will recommend a package." } : null;
};

const prescriptionText = (state, lens) => {
  if (state.rxChoice === "send_later") return "I will send it here";
  if (state.rxChoice === "none") return "No prescription (plain lenses)";
  if (state.rxChoice !== "enter") return "";
  const check = checkRx(state, lens);
  const summary = check.ok ? summarizeRx(check.value) : null;
  return summary ? `Right ${summary.right} | Left ${summary.left} | ${summary.pd}` : "";
};

export const describeSelection = (state, bySlug) => {
  const frames = resolveFrames(state, bySlug);
  const lens = lensProductOf(state, bySlug);
  const check = state.rxChoice === "enter" ? checkRx(state, lens) : null;
  return {
    frames: frames.map(describeFrame),
    frameNote: state.frameMode === "choose" ? "" : state.frameNote.trim(),
    frameMode: state.frameMode,
    usageLabel: labelOf(USAGE, state.usage),
    lens: lensDescription(state, lens),
    extraLabels: extrasPayload(state, lens).map((extra) => labelOf(COATINGS, extra)),
    tintLabel: showsTintPicker(lens) && state.tintColor ? labelOf(TINT_COLORS, state.tintColor) : "",
    rxChoice: state.rxChoice,
    rxSummary: check?.ok ? summarizeRx(check.value) : null,
    rxWarnings: check?.ok ? check.warnings : [],
    prescriptionText: prescriptionText(state, lens),
  };
};

const frameLine = (frame) => {
  const details = [frame.colorLabel, frame.sizeText].filter(Boolean).join(", ");
  return details ? `${frame.name} (${details})` : frame.name;
};

const frameLines = (selection) => {
  if (selection.frames.length > 0) return selection.frames.map((frame) => `Frame: ${frameLine(frame)}`);
  return selection.frameMode === "own" ? [`Own frame: ${selection.frameNote}`] : [`Looking for: ${selection.frameNote}`];
};

const sourceText = (attribution) =>
  [attribution.source, attribution.medium, attribution.campaign].filter(Boolean).join("/");

export const buildSummary = (state, bySlug, ref = null) => {
  const selection = describeSelection(state, bySlug);
  const { name, city, phone, email, notes } = state.contact;
  return {
    ref,
    frameLines: frameLines(selection),
    usage: selection.usageLabel,
    lens: selection.lens ? selection.lens.name : "Please suggest",
    prescription: selection.prescriptionText,
    name: name.trim(),
    city: city.trim(),
    phone,
    email,
    notes: notes.trim(),
    source: sourceText(getAttribution()),
  };
};
