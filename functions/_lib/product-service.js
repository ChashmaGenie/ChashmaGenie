import { ERROR_CODES, ROUTES } from "./contract.js";
import { purgeEdge } from "./cache.js";
import { copyOf, findProduct, orphanedImageIds, replaceProduct, slugTaken, uniqueSlug, withoutProducts } from "./catalog-ops.js";
import { makeProductId } from "./ids.js";
import { deleteImages } from "./images.js";
import { fail, isPlainObject } from "./http.js";
import { modifyCatalog } from "./kv.js";
import { validateProduct } from "../../shared/schema.js";

const MAX_IMAGE_DELETES_PER_REQUEST = 20;

const MAX_PURGES_PER_REQUEST = 30;

const productPage = (slug) => `/p/${slug}`;

export const purgeCatalog = (context, { slugs = [], imageIds = [] } = {}) => {
  const pathnames = [
    ROUTES.catalog,
    ROUTES.sitemap,
    ...slugs.map(productPage),
    ...imageIds.map(ROUTES.image),
  ];
  context.waitUntil(purgeEdge(context.request, pathnames.slice(0, MAX_PURGES_PER_REQUEST)));
};

export const requireProductBody = (body) =>
  isPlainObject(body) ? body : fail(ERROR_CODES.badRequest, "The request body must be an object.");

export const requireProduct = (products, id) =>
  findProduct(products, id) ?? fail(ERROR_CODES.notFound, "Product not found.");

const assertValid = (check) => {
  if (!check.ok) fail(ERROR_CODES.validation, "Please check the highlighted fields.", check.errors);
  return check.value;
};

const assertSlugFree = (products, slug, ignoreId) => {
  if (slugTaken(products, slug, ignoreId)) {
    fail(ERROR_CODES.conflict, "Another product already uses that web address name.", { slug: "Already in use." });
  }
};

const hasExplicitSlug = (body) => typeof body.slug === "string" && body.slug.trim() !== "";

const slugSource = (body) => (hasExplicitSlug(body) ? body.slug : body.name);

const isRenamed = (existing, body) => String(body.name ?? "").trim() !== existing.name;

const slugForUpdate = (existing, body, products) =>
  existing.slugFollowsName && isRenamed(existing, body) ? uniqueSlug(products, body.name, existing.id) : body.slug;

const followsNameAfter = (existing, body) => existing.slugFollowsName === true && !isRenamed(existing, body);

export const createProduct = (env, body, now = new Date().toISOString()) =>
  modifyCatalog(
    env,
    (catalog) => {
      const draft = {
        ...body,
        id: makeProductId(),
        createdAt: now,
        sample: false,
        slug: hasExplicitSlug(body) ? body.slug : uniqueSlug(catalog.products, slugSource(body)),
      };
      const product = assertValid(validateProduct(draft, now));
      assertSlugFree(catalog.products, product.slug);
      return { products: [product, ...catalog.products], result: { product, slugs: [product.slug] } };
    },
    now,
  );

export const updateProduct = (env, id, body, now = new Date().toISOString()) =>
  modifyCatalog(
    env,
    (catalog) => {
      const existing = requireProduct(catalog.products, id);
      const draft = {
        ...body,
        id,
        createdAt: existing.createdAt,
        sample: typeof body.sample === "boolean" ? body.sample : Boolean(existing.sample),
        slug: slugForUpdate(existing, body, catalog.products),
        slugFollowsName: followsNameAfter(existing, body),
      };
      const product = assertValid(validateProduct(draft, now));
      assertSlugFree(catalog.products, product.slug, id);
      return {
        products: replaceProduct(catalog.products, product),
        result: { product, slugs: [...new Set([existing.slug, product.slug])] },
      };
    },
    now,
  );

const QUICK_FIELDS = {
  visible: (value) => typeof value === "boolean",
  featured: (value) => typeof value === "boolean",
  stock: (value) => ["in_stock", "made_to_order", "out_of_stock"].includes(value),
};

const quickPatch = (body) => {
  const entries = Object.entries(body).filter(([key]) => key in QUICK_FIELDS);
  const invalid = entries.filter(([key, value]) => !QUICK_FIELDS[key](value));
  if (entries.length === 0) fail(ERROR_CODES.badRequest, "Nothing to change.");
  if (invalid.length > 0) {
    fail(ERROR_CODES.validation, "Invalid value.", Object.fromEntries(invalid.map(([key]) => [key, "Invalid value."])));
  }
  return Object.fromEntries(entries);
};

export const patchProduct = (env, id, body, now = new Date().toISOString()) => {
  const patch = quickPatch(body);
  return modifyCatalog(
    env,
    (catalog) => {
      const updated = { ...requireProduct(catalog.products, id), ...patch, updatedAt: now };
      return { products: replaceProduct(catalog.products, updated), result: { product: updated, slugs: [updated.slug] } };
    },
    now,
  );
};

export const duplicateProduct = (env, id, now = new Date().toISOString()) =>
  modifyCatalog(
    env,
    (catalog) => {
      const copy = copyOf(requireProduct(catalog.products, id), catalog.products, makeProductId(), now);
      return { products: [copy, ...catalog.products], result: { product: copy, slugs: [] } };
    },
    now,
  );

export const deleteProducts = async (env, idsToDelete, now = new Date().toISOString()) => {
  const outcome = await modifyCatalog(
    env,
    (catalog) => {
      const removed = catalog.products.filter((product) => idsToDelete.has(product.id));
      if (removed.length === 0) return { result: { count: 0, slugs: [], imageIds: [] } };
      const remaining = withoutProducts(catalog.products, idsToDelete);
      const imageIds = orphanedImageIds(removed, remaining).slice(0, MAX_IMAGE_DELETES_PER_REQUEST);
      return { products: remaining, result: { count: removed.length, slugs: removed.map((product) => product.slug), imageIds } };
    },
    now,
  );
  await deleteImages(env, outcome.imageIds);
  return outcome;
};
