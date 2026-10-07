export const upsertProduct = (products, product) =>
  products.some((entry) => entry.id === product.id)
    ? products.map((entry) => (entry.id === product.id ? product : entry))
    : [product, ...products];

export const withoutProducts = (products, ids) => products.filter((product) => !ids.includes(product.id));

export const patchProduct = (products, id, patch) =>
  products.map((product) => (product.id === id ? { ...product, ...patch } : product));

export const sampleProducts = (products) => products.filter((product) => product.sample);

export const IN_STOCK_PATCH = Object.freeze({ stock: "in_stock" });
export const OUT_OF_STOCK_PATCH = Object.freeze({ stock: "out_of_stock" });
