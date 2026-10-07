const byCategory = (category) => (product) => product.category === category;

export const PRODUCT_FILTERS = [
  { value: "all", label: "All", matches: () => true },
  { value: "eyeglasses", label: "Eyeglasses", matches: byCategory("eyeglasses") },
  { value: "sunglasses", label: "Sunglasses", matches: byCategory("sunglasses") },
  { value: "computer", label: "Computer", matches: byCategory("computer") },
  { value: "kids", label: "Kids", matches: byCategory("kids") },
  { value: "lenses", label: "Lenses", matches: byCategory("lenses") },
  { value: "hidden", label: "Hidden", matches: (product) => product.visible === false },
  { value: "out_of_stock", label: "Out of stock", matches: (product) => product.stock === "out_of_stock" },
  { value: "sample", label: "Sample", matches: (product) => product.sample === true },
];

const searchableText = (product) => [product.name, product.sku, product.brand, product.shape].filter(Boolean).join(" ").toLowerCase();

export const matchesSearch = (product, query) => {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const text = searchableText(product);
  return terms.every((term) => text.includes(term));
};

export const filterProducts = (products, filterValue, query) => {
  const filter = PRODUCT_FILTERS.find((entry) => entry.value === filterValue) ?? PRODUCT_FILTERS[0];
  return products.filter((product) => filter.matches(product) && matchesSearch(product, query));
};

export const productStats = (products) => ({
  total: products.length,
  visible: products.filter((product) => product.visible !== false).length,
  hidden: products.filter((product) => product.visible === false).length,
  outOfStock: products.filter((product) => product.stock === "out_of_stock").length,
});
