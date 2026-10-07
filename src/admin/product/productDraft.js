import { COATINGS, FACE_SHAPES, FACE_SHAPE_FITS } from "@shared/enums.js";

const INCLUDED_COATINGS = COATINGS.filter((coating) => coating.included).map((coating) => coating.value);

const blankSize = () => ({ lens: "", bridge: "", temple: "" });

const defaultLens = () => ({
  lensType: "single_vision",
  index: "1.50",
  treatment: "clear",
  coatings: [...INCLUDED_COATINGS],
  note: "",
});

export const blankDraft = () => ({
  name: "",
  category: "eyeglasses",
  gender: "unisex",
  price: "",
  compareAtPrice: "",
  description: "",
  descriptionUr: "",
  stock: "in_stock",
  shape: "",
  rim: "",
  material: "",
  colors: [],
  features: [],
  faceShapes: [],
  faceShapesTouched: false,
  sizes: [blankSize()],
  lens: defaultLens(),
  visible: true,
  featured: false,
  badge: "",
  rxCompatible: true,
  multifocalOk: false,
});

const text = (value) => (value === undefined || value === null ? "" : String(value));

const sizeToDraft = (size) => ({ lens: text(size.lens), bridge: text(size.bridge), temple: text(size.temple) });

const lensToDraft = (lens) => {
  const base = defaultLens();
  if (!lens) return base;
  return {
    ...base,
    lensType: lens.lensType ?? base.lensType,
    index: lens.index ?? base.index,
    treatment: lens.treatment ?? base.treatment,
    coatings: [...new Set([...INCLUDED_COATINGS, ...(lens.coatings ?? [])])],
    note: text(lens.note),
  };
};

export const draftFromProduct = (product) => ({
  ...blankDraft(),
  name: product.name,
  category: product.category,
  gender: product.gender,
  price: text(product.price),
  compareAtPrice: text(product.compareAtPrice),
  description: text(product.description),
  descriptionUr: text(product.descriptionUr),
  stock: product.stock,
  shape: text(product.shape),
  rim: text(product.rim),
  material: text(product.material),
  colors: product.colors ?? [],
  features: product.features ?? [],
  faceShapes: product.faceShapes ?? [],
  faceShapesTouched: (product.faceShapes ?? []).length > 0,
  sizes: product.sizes?.length ? product.sizes.map(sizeToDraft) : [blankSize()],
  lens: lensToDraft(product.lens),
  visible: product.visible !== false,
  featured: product.featured === true,
  badge: product.badges?.includes("bestseller") ? "bestseller" : product.badges?.[0] ?? "",
  rxCompatible: product.rxCompatible !== false,
  multifocalOk: product.multifocalOk === true,
});

const isBlankSize = (size) => !size.lens && !size.bridge && !size.temple;

export const payloadFromDraft = (draft, { images, base }) => ({
  ...(base ? { id: base.id, slug: base.slug, brand: base.brand, sku: base.sku, createdAt: base.createdAt } : {}),
  name: draft.name,
  category: draft.category,
  gender: draft.gender,
  price: draft.price,
  compareAtPrice: draft.compareAtPrice,
  description: draft.description,
  descriptionUr: draft.descriptionUr,
  stock: draft.stock,
  shape: draft.shape,
  rim: draft.rim,
  material: draft.material,
  colors: draft.colors,
  features: draft.features,
  faceShapes: draft.faceShapes,
  sizes: draft.sizes.filter((size, index) => index === 0 || !isBlankSize(size)),
  lens: { ...draft.lens, coatings: [...new Set([...INCLUDED_COATINGS, ...draft.lens.coatings])] },
  visible: draft.visible,
  featured: draft.featured,
  badges: draft.badge ? [draft.badge] : [],
  rxCompatible: draft.rxCompatible,
  multifocalOk: draft.multifocalOk,
  sample: false,
  images,
});

export const suggestFaceShapes = (shape) =>
  FACE_SHAPES.map((entry) => entry.value).filter((faceShape) => FACE_SHAPE_FITS[faceShape]?.includes(shape));

export const toggledInList = (list, value) => (list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]);

export const isLensCategory = (category) => category === "lenses";

export const withSizeChanged = (sizes, index, key, value) =>
  sizes.map((size, position) => (position === index ? { ...size, [key]: value } : size));

export const withSizeRemoved = (sizes, index) => sizes.filter((_, position) => position !== index);

export const withSizeAdded = (sizes) => [...sizes, { lens: "", bridge: "", temple: "" }];

export const errorSectionOf = (path) => {
  if (path === "images") return "photos";
  if (path.startsWith("lens")) return "lens";
  if (["shape", "rim", "material", "colors", "sizes", "faceShapes", "features"].some((key) => path.startsWith(key))) return "style";
  return "basics";
};
