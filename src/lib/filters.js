import {
  CATEGORIES,
  COLORS,
  FACE_SHAPES,
  FACE_SHAPE_FITS,
  FEATURES,
  GENDERS,
  LENS_INDEXES,
  LENS_TREATMENTS,
  LENS_TYPES,
  MATERIALS,
  RIM_TYPES,
  SHAPES,
  SIZE_LABELS,
  labelOf,
} from "@shared/enums.js";

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "bestseller", label: "Bestsellers" },
];

export const PRICE_PRESETS = [
  { id: "under-3000", label: "Under 3,000", min: null, max: 2999 },
  { id: "3000-6000", label: "3,000 - 5,999", min: 3000, max: 5999 },
  { id: "6000-10000", label: "6,000 - 9,999", min: 6000, max: 9999 },
  { id: "over-10000", label: "10,000+", min: 10000, max: null },
];

const FEATURE_FILTERS = [
  { value: "rx", label: "Prescription-ready" },
  { value: "blue_light", label: "Blue-light" },
  { value: "polarized", label: "Polarized" },
  { value: "adjustable_nose_pads", label: "Adjustable nose pads" },
  { value: "spring_hinge", label: "Spring hinges" },
  { value: "lightweight", label: "Lightweight" },
];

const LENS_FEATURE_FILTERS = [
  { value: "blue_light", label: "Blue-light" },
  { value: "polarized", label: "Polarized" },
  { value: "uv400", label: "UV400" },
];

const BADGE_FILTERS = [
  { value: "new", label: "New" },
  { value: "bestseller", label: "Bestseller" },
];

const FRAME_ONLY = "frames";
const LENS_ONLY = "lenses";

const hasFeature = (product, feature) =>
  feature === "rx" ? product.rxCompatible : product.features.includes(feature);

const fitsFaceShape = (product, face) => (FACE_SHAPE_FITS[face] ?? []).includes(product.shape);

export const FILTER_GROUPS = [
  { key: "gender", title: "Gender", scope: FRAME_ONLY, options: GENDERS, matches: (p, v) => p.gender === v },
  { key: "shape", title: "Shape", scope: FRAME_ONLY, options: SHAPES, matches: (p, v) => p.shape === v },
  { key: "rim", title: "Frame type", scope: FRAME_ONLY, options: RIM_TYPES, matches: (p, v) => p.rim === v },
  { key: "material", title: "Material", scope: FRAME_ONLY, options: MATERIALS, matches: (p, v) => p.material === v },
  {
    key: "size",
    title: "Size",
    scope: FRAME_ONLY,
    options: SIZE_LABELS.map(({ value, label, hint }) => ({ value, label: `${label} (${hint})` })),
    matches: (p, v) => p.sizeLabel === v,
  },
  { key: "color", title: "Colour", scope: FRAME_ONLY, options: COLORS, matches: (p, v) => p.colors.includes(v), swatch: true },
  {
    key: "face",
    title: "Best for my face",
    scope: FRAME_ONLY,
    options: FACE_SHAPES,
    matches: fitsFaceShape,
  },
  {
    key: "feat",
    title: "Features",
    scope: FRAME_ONLY,
    options: FEATURE_FILTERS,
    matches: hasFeature,
    requireAll: true,
  },
  { key: "lensType", title: "Lens type", scope: LENS_ONLY, options: LENS_TYPES, matches: (p, v) => p.lens?.lensType === v },
  { key: "lensIndex", title: "Lens thickness", scope: LENS_ONLY, options: LENS_INDEXES, matches: (p, v) => p.lens?.index === v },
  {
    key: "lensTreatment",
    title: "Lens treatment",
    scope: LENS_ONLY,
    options: LENS_TREATMENTS,
    matches: (p, v) => p.lens?.treatment === v,
  },
  {
    key: "lensFeat",
    title: "Lens features",
    scope: LENS_ONLY,
    options: LENS_FEATURE_FILTERS,
    matches: hasFeature,
    requireAll: true,
  },
  { key: "badge", title: "Badges", scope: null, options: BADGE_FILTERS, matches: (p, v) => p.badges.includes(v) },
];

const URL_PARAMS = {
  gender: "gender",
  shape: "shape",
  rim: "rim",
  material: "material",
  size: "size",
  color: "color",
  face: "face",
  feat: "feat",
  lensType: "lt",
  lensIndex: "li",
  lensTreatment: "tr",
  lensFeat: "lf",
  badge: "badge",
};

const CATEGORY_VALUES = CATEGORIES.map(({ value }) => value);
const SORT_VALUES = SORTS.map(({ value }) => value);

export const isCategory = (value) => CATEGORY_VALUES.includes(value);

export const emptyFilters = () => ({
  category: null,
  q: "",
  priceMin: null,
  priceMax: null,
  inStock: false,
  sort: "featured",
  ...Object.fromEntries(FILTER_GROUPS.map((group) => [group.key, []])),
});

const groupsForCategory = (category) =>
  FILTER_GROUPS.filter((group) => group.scope === null || group.scope === (category === "lenses" ? LENS_ONLY : FRAME_ONLY));

export const visibleGroups = (category) => groupsForCategory(category);

const parseList = (raw, group) => {
  if (!raw) return [];
  const allowed = group.options.map(({ value }) => value);
  return [...new Set(raw.split(",").filter((value) => allowed.includes(value)))];
};

const parsePrice = (raw) => {
  const value = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(value) && value >= 0 ? value : null;
};

export const parseFilters = (searchParams, category = null) => {
  const base = emptyFilters();
  const lists = Object.fromEntries(
    FILTER_GROUPS.map((group) => [group.key, parseList(searchParams.get(URL_PARAMS[group.key]), group)]),
  );
  const sort = searchParams.get("sort");
  return retainApplicable({
    ...base,
    ...lists,
    category: isCategory(category) ? category : null,
    q: (searchParams.get("q") ?? "").trim().slice(0, 80),
    priceMin: parsePrice(searchParams.get("min")),
    priceMax: parsePrice(searchParams.get("max")),
    inStock: searchParams.get("stock") === "1",
    sort: SORT_VALUES.includes(sort) ? sort : base.sort,
  });
};

export const serializeFilters = (filters) => {
  const params = new URLSearchParams();
  FILTER_GROUPS.forEach((group) => {
    const values = filters[group.key];
    if (values.length > 0) params.set(URL_PARAMS[group.key], values.join(","));
  });
  if (filters.q) params.set("q", filters.q);
  if (filters.priceMin !== null) params.set("min", String(filters.priceMin));
  if (filters.priceMax !== null) params.set("max", String(filters.priceMax));
  if (filters.inStock) params.set("stock", "1");
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  return params;
};

export const shopPath = (filters) => {
  const query = serializeFilters(filters).toString();
  const base = filters.category ? `/shop/${filters.category}` : "/shop";
  return query ? `${base}?${query}` : base;
};

const matchesGroup = (product, group, selected) => {
  if (selected.length === 0) return true;
  const test = (value) => group.matches(product, value);
  return group.requireAll ? selected.every(test) : selected.some(test);
};

const inPriceRange = (product, min, max) =>
  (min === null || product.price >= min) && (max === null || product.price <= max);

const searchableText = (() => {
  const cache = new WeakMap();
  const build = (product) =>
    [
      product.name,
      product.brand,
      labelOf(CATEGORIES, product.category),
      product.shape ? labelOf(SHAPES, product.shape) : "",
      product.material ? labelOf(MATERIALS, product.material) : "",
      ...product.colors.map((color) => labelOf(COLORS, color)),
      product.description,
    ]
      .join(" ")
      .toLowerCase();
  return (product) => {
    if (!cache.has(product)) cache.set(product, build(product));
    return cache.get(product);
  };
})();

const matchesQuery = (product, q) => {
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const text = searchableText(product);
  return tokens.every((token) => text.includes(token));
};

const matchesCategory = (product, filters) => {
  if (filters.category) return product.category === filters.category;
  return product.category !== "lenses" || filters.q.length > 0;
};

const matchesCore = (product, filters) =>
  matchesCategory(product, filters) &&
  matchesQuery(product, filters.q) &&
  inPriceRange(product, filters.priceMin, filters.priceMax) &&
  (!filters.inStock || product.stock !== "out_of_stock");

const matchesGroupsExcept = (product, filters, skippedKey) =>
  FILTER_GROUPS.every((group) => group.key === skippedKey || matchesGroup(product, group, filters[group.key]));

const byNewest = (a, b) => b.createdAt.localeCompare(a.createdAt);
const rank = (product, badge) => (product.badges.includes(badge) ? 1 : 0);

const COMPARATORS = {
  newest: byNewest,
  price_asc: (a, b) => a.price - b.price || byNewest(a, b),
  price_desc: (a, b) => b.price - a.price || byNewest(a, b),
  featured: (a, b) => Number(b.featured) - Number(a.featured) || byNewest(a, b),
  bestseller: (a, b) =>
    rank(b, "bestseller") - rank(a, "bestseller") || Number(b.featured) - Number(a.featured) || byNewest(a, b),
};

export const sortProducts = (products, sort) => [...products].sort(COMPARATORS[sort] ?? COMPARATORS.featured);

export const applyFilters = (products, filters) =>
  sortProducts(
    products.filter((product) => matchesCore(product, filters) && matchesGroupsExcept(product, filters, null)),
    filters.sort,
  );

const coreMatches = (products, filters) => products.filter((product) => matchesCore(product, filters));

export const facetCounts = (products, filters) => {
  const pool = coreMatches(products, filters);
  return Object.fromEntries(
    groupsForCategory(filters.category).map((group) => {
      const others = pool.filter((product) => matchesGroupsExcept(product, filters, group.key));
      const counts = Object.fromEntries(
        group.options.map(({ value }) => [value, others.filter((product) => group.matches(product, value)).length]),
      );
      return [group.key, counts];
    }),
  );
};

export const pricePresetCounts = (products, filters) => {
  const pool = products.filter(
    (product) =>
      matchesCategory(product, filters) &&
      matchesQuery(product, filters.q) &&
      (!filters.inStock || product.stock !== "out_of_stock") &&
      matchesGroupsExcept(product, filters, null),
  );
  return Object.fromEntries(
    PRICE_PRESETS.map((preset) => [preset.id, pool.filter((product) => inPriceRange(product, preset.min, preset.max)).length]),
  );
};

export const categoryCounts = (products, filters) => {
  const withoutCategory = { ...filters, category: null };
  const pool = products.filter(
    (product) =>
      matchesQuery(product, filters.q) &&
      inPriceRange(product, filters.priceMin, filters.priceMax) &&
      (!filters.inStock || product.stock !== "out_of_stock") &&
      matchesGroupsExcept(product, withoutCategory, null),
  );
  return {
    all: pool.filter((product) => matchesCategory(product, withoutCategory)).length,
    ...Object.fromEntries(CATEGORY_VALUES.map((value) => [value, pool.filter((p) => p.category === value).length])),
  };
};

export const activePricePreset = (filters) =>
  PRICE_PRESETS.find((preset) => preset.min === filters.priceMin && preset.max === filters.priceMax) ?? null;

export const toggleValue = (filters, key, value) => {
  const current = filters[key];
  const next = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
  return { ...filters, [key]: next };
};

export const withPriceRange = (filters, min, max) => ({ ...filters, priceMin: min, priceMax: max });

export const retainApplicable = (filters) => {
  const applicable = new Set(groupsForCategory(filters.category).map((group) => group.key));
  const cleared = Object.fromEntries(
    FILTER_GROUPS.filter((group) => !applicable.has(group.key)).map((group) => [group.key, []]),
  );
  return { ...filters, ...cleared };
};

export const withCategory = (filters, category) => retainApplicable({ ...filters, category });

const priceChipLabel = (filters) => {
  const preset = activePricePreset(filters);
  if (preset) return preset.label;
  const { priceMin: min, priceMax: max } = filters;
  if (min !== null && max !== null) return `Rs ${min} - ${max}`;
  return min !== null ? `Rs ${min}+` : `Up to Rs ${max}`;
};

export const activeChips = (filters) => {
  const groupChips = groupsForCategory(filters.category).flatMap((group) =>
    filters[group.key].map((value) => ({
      id: `${group.key}:${value}`,
      group: group.key,
      value,
      label: labelOf(group.options, value),
    })),
  );
  const priceChip = filters.priceMin !== null || filters.priceMax !== null ? [{ id: "price", group: "price", label: priceChipLabel(filters) }] : [];
  const stockChip = filters.inStock ? [{ id: "stock", group: "stock", label: "In stock only" }] : [];
  const queryChip = filters.q ? [{ id: "q", group: "q", label: `"${filters.q}"` }] : [];
  return [...queryChip, ...groupChips, ...priceChip, ...stockChip];
};

export const removeChip = (filters, chip) => {
  if (chip.group === "price") return withPriceRange(filters, null, null);
  if (chip.group === "stock") return { ...filters, inStock: false };
  if (chip.group === "q") return { ...filters, q: "" };
  return toggleValue(filters, chip.group, chip.value);
};

export const clearFilters = (filters) => ({ ...emptyFilters(), category: filters.category, sort: filters.sort });

export const countActiveFilters = (filters) =>
  activeChips(filters).filter((chip) => chip.group !== "q").length;
