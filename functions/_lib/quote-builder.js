import { validateRx } from "../../shared/rx.js";

const MULTIFOCAL_TYPES = ["progressive", "bifocal"];
const MOBILE_AGENT = /mobile|android|iphone|ipad/i;
const RX_KEYS = ["mode", "cylFormat", "right", "left", "pdMode", "pd"];
const EYE_KEYS = ["sph", "cyl", "axis", "add"];

const pick = (source, keys) =>
  Object.fromEntries(keys.filter((key) => source?.[key] !== undefined).map((key) => [key, source[key]]));

const visibleProducts = (catalog) => catalog.products.filter((product) => product.visible !== false);

const findLensPackage = (catalog, packageId) =>
  packageId
    ? visibleProducts(catalog).find((product) => product.id === packageId && product.category === "lenses")
    : null;

const ownFrameItem = (item) => ({
  productId: null,
  productSlug: "",
  productName: "Own frame",
  colorKey: "",
  sizeIndex: null,
  framePrice: 0,
  ownFrame: true,
  note: item.note,
});

const suggestedFrameItem = (item) => ({ ...ownFrameItem(item), productName: "Frame to be suggested", ownFrame: false });

const catalogFrameItem = (item, product) => ({
  productId: product.id,
  productSlug: product.slug,
  productName: product.name,
  colorKey: item.colorKey,
  sizeIndex: item.sizeIndex,
  framePrice: product.price,
  ownFrame: false,
  note: item.note,
});

const frameItemProblems = (item, product, index) => {
  const path = `items.${index}`;
  if (!product) return { [`${path}.slug`]: "This frame is no longer available." };
  if (product.category === "lenses") return { [`${path}.slug`]: "Choose a frame, not a lens package." };
  const colorKnown = !item.colorKey || product.colors.includes(item.colorKey);
  const sizeKnown = item.sizeIndex === null || Boolean(product.sizes[item.sizeIndex]);
  return {
    ...(colorKnown ? {} : { [`${path}.colorKey`]: "That colour is not available." }),
    ...(sizeKnown ? {} : { [`${path}.sizeIndex`]: "That size is not available." }),
  };
};

const resolveItems = (inputItems, catalog) => {
  const products = visibleProducts(catalog);
  const resolved = inputItems.map((item, index) => {
    if (item.ownFrame) return { item: ownFrameItem(item), problems: {} };
    if (!item.slug) return { item: suggestedFrameItem(item), problems: {} };
    const product = products.find((candidate) => candidate.slug === item.slug);
    return { item: product ? catalogFrameItem(item, product) : null, problems: frameItemProblems(item, product, index) };
  });
  const problems = Object.assign({}, ...resolved.map((entry) => entry.problems));
  return { items: resolved.map((entry) => entry.item), problems };
};

const lensPackageSnapshot = (product, input) =>
  product
    ? {
        productId: product.id,
        name: product.name,
        lensType: product.lens.lensType,
        index: product.lens.index,
        treatment: product.lens.treatment,
        coatings: [...new Set([...product.lens.coatings, ...input.extras])],
        tintColor: input.tintColor,
        note: product.lens.note ?? "",
      }
    : null;

const needsAddPower = (lensPackage) => MULTIFOCAL_TYPES.includes(lensPackage?.lensType);

const eyeSnapshot = (eye, keepAdd) => pick(eye, keepAdd ? EYE_KEYS : EYE_KEYS.filter((key) => key !== "add"));

const enteredRx = (input, lensPackage) => {
  const check = validateRx(input.rx, { needsAdd: needsAddPower(lensPackage) });
  const errors = Object.fromEntries(Object.entries(check.errors ?? {}).map(([path, message]) => [`rx.${path}`, message]));
  const source = check.value ?? {};
  const rx = {
    ...pick(source, RX_KEYS),
    mode: "enter",
    cylFormat: "minus",
    right: eyeSnapshot(source.right, needsAddPower(lensPackage)),
    left: eyeSnapshot(source.left, needsAddPower(lensPackage)),
    pd: source.pd ?? null,
    warnings: check.warnings ?? [],
  };
  return { rx, errors };
};

const resolveRx = (input, lensPackage) => {
  if (!input.rx) return { rx: null, errors: {} };
  if (input.rx.mode !== "enter") return { rx: { mode: "send_later" }, errors: {} };
  return enteredRx(input, lensPackage);
};

const sumFramePrices = (items) => items.reduce((total, item) => total + item.framePrice, 0);

export const buildQuote = ({ input, catalog, id, now, userAgent }) => {
  const { items, problems: itemProblems } = resolveItems(input.items, catalog);
  const lensProduct = findLensPackage(catalog, input.lensPackageId);
  const packageProblem = input.lensPackageId && !lensProduct ? { lensPackageId: "That lens package is no longer available." } : {};
  const lensPackage = lensPackageSnapshot(lensProduct, input);
  const { rx, errors: rxProblems } = resolveRx(input, lensPackage);
  const errors = { ...itemProblems, ...packageProblem, ...rxProblems };
  if (Object.keys(errors).length > 0) return { errors };
  const quote = {
    id,
    createdAt: now,
    status: "new",
    statusUpdatedAt: now,
    items,
    usage: input.usage,
    lensPackage,
    rx,
    contact: input.contact,
    consent: true,
    attribution: input.attribution,
    userAgentClass: MOBILE_AGENT.test(userAgent ?? "") ? "mobile" : "desktop",
    ownerNotes: "",
    estimatedFramePrice: sumFramePrices(items),
  };
  return { quote, errors: {} };
};
