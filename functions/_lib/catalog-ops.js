import { IMAGE_ID_PATTERN } from "./contract.js";
import { slugify } from "../../shared/schema.js";

const isUploadedImage = (ref) => IMAGE_ID_PATTERN.test(ref);

export const findProduct = (products, id) => products.find((product) => product.id === id);

export const slugTaken = (products, slug, ignoreId) =>
  products.some((product) => product.slug === slug && product.id !== ignoreId);

export const uniqueSlug = (products, baseSlug, ignoreId) => {
  const base = slugify(baseSlug) || "product";
  const candidates = [base, ...Array.from({ length: 50 }, (_, index) => `${base}-${index + 2}`)];
  return candidates.find((candidate) => !slugTaken(products, candidate, ignoreId)) ?? `${base}-${Date.now()}`;
};

export const replaceProduct = (products, updated) =>
  products.map((product) => (product.id === updated.id ? updated : product));

export const withoutProducts = (products, ids) => products.filter((product) => !ids.has(product.id));

export const uploadedImageIds = (products) =>
  new Set(products.flatMap((product) => product.images).filter(isUploadedImage));

export const orphanedImageIds = (removedProducts, remainingProducts) => {
  const stillUsed = uploadedImageIds(remainingProducts);
  return [...uploadedImageIds(removedProducts)].filter((id) => !stillUsed.has(id));
};

export const isImageReferenced = (products, imageId) => uploadedImageIds(products).has(imageId);

export const copyOf = (product, products, newId, now) => ({
  ...product,
  id: newId,
  name: `${product.name} (copy)`,
  slug: uniqueSlug(products, `${product.slug}-copy`),
  visible: false,
  featured: false,
  sample: false,
  slugFollowsName: true,
  badges: [],
  createdAt: now,
  updatedAt: now,
});
