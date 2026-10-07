import { safeGet, safeRemove, safeSet } from "@/lib/storage.js";

export const DRAFT_KEY = "cg_quote_draft";
export const MAX_FRAMES = 5;

const emptyEye = { sph: "", cyl: "0", axis: "", add: "" };

export const initialQuoteState = {
  step: 0,
  frameMode: "choose",
  items: [],
  frameNote: "",
  usage: null,
  lensChoice: null,
  lensSlug: null,
  extras: [],
  tintColor: null,
  rxChoice: null,
  cylFormat: "minus",
  right: emptyEye,
  left: emptyEye,
  pdMode: null,
  pd: { single: "", right: "", left: "" },
  contact: { name: "", phone: "", city: "", channel: "whatsapp", email: "", notes: "" },
  consent: false,
  website: "",
};

const withoutDuplicates = (items) =>
  items.filter((item, index) => items.findIndex((other) => other.slug === item.slug) === index);

const toggled = (list, value) => (list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]);

const withUsageDefaults = (state, usage) => {
  const extras = usage === "computer" ? [...new Set([...state.extras, "blue_light_filter"])] : state.extras;
  return { ...state, usage, extras };
};

const withLensPackage = (state, slug) => ({ ...state, lensChoice: "package", lensSlug: slug, tintColor: null });

const withCylFormat = (state, cylFormat) => ({
  ...state,
  cylFormat,
  right: { ...state.right, cyl: "0", axis: "" },
  left: { ...state.left, cyl: "0", axis: "" },
});

const updatedItem = (items, slug, patch) => items.map((item) => (item.slug === slug ? { ...item, ...patch } : item));

export const quoteReducer = (state, action) => {
  switch (action.type) {
    case "goto":
      return { ...state, step: action.step };
    case "patch":
      return { ...state, ...action.patch };
    case "addItem":
      return { ...state, items: withoutDuplicates([...state.items, action.item]).slice(0, MAX_FRAMES) };
    case "removeItem":
      return { ...state, items: state.items.filter((item) => item.slug !== action.slug) };
    case "updateItem":
      return { ...state, items: updatedItem(state.items, action.slug, action.patch) };
    case "setUsage":
      return withUsageDefaults(state, action.usage);
    case "chooseLensPackage":
      return withLensPackage(state, action.slug);
    case "toggleExtra":
      return { ...state, extras: toggled(state.extras, action.extra) };
    case "setCylFormat":
      return withCylFormat(state, action.cylFormat);
    case "setEye":
      return { ...state, [action.side]: { ...state[action.side], [action.field]: action.value } };
    case "setPd":
      return { ...state, pd: { ...state.pd, [action.field]: action.value } };
    case "setContact":
      return { ...state, contact: { ...state.contact, [action.field]: action.value } };
    case "reset":
      return initialQuoteState;
    default:
      return state;
  }
};

const isDraft = (draft) => Boolean(draft) && typeof draft === "object" && Array.isArray(draft.items);

export const loadDraft = () => {
  const draft = safeGet(DRAFT_KEY, "session");
  return isDraft(draft) ? { ...initialQuoteState, ...draft, website: "" } : null;
};

export const saveDraft = (state) => safeSet(DRAFT_KEY, state, "session");

export const clearDraft = () => safeRemove(DRAFT_KEY, "session");

const asFrameItem = (entry) => ({ slug: entry.slug, colorKey: entry.colorKey ?? null, sizeIndex: entry.sizeIndex ?? 0 });

export const startingState = ({ draft, basketItems, slug, color, size, lens }) => {
  const base = draft ?? { ...initialQuoteState, items: basketItems.map(asFrameItem) };
  const sizeIndex = Number.parseInt(size, 10);
  const routeItem = slug ? [{ slug, colorKey: color || null, sizeIndex: Number.isInteger(sizeIndex) ? sizeIndex : 0 }] : [];
  const items = withoutDuplicates([...routeItem, ...base.items]).slice(0, MAX_FRAMES);
  const withFrames = { ...base, items, frameMode: slug ? "choose" : base.frameMode };
  return lens ? withLensPackage(withFrames, lens) : withFrames;
};
