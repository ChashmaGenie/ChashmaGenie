import { json, readOptionalJson, route } from "../../_lib/http.js";
import { modifyCatalog } from "../../_lib/kv.js";
import { purgeCatalog } from "../../_lib/product-service.js";
import { SEED_CATALOG } from "../../../shared/seed-catalog.js";

const BODY_LIMIT_BYTES = 1024;

const hasNoProducts = (catalog) => catalog.products.length === 0;

const withoutSamples = (products) => products.filter((product) => !product.sample);

const seedProducts = (existing, now) => {
  const takenSlugs = new Set(existing.map((product) => product.slug));
  return SEED_CATALOG.products
    .filter((product) => !takenSlugs.has(product.slug))
    .map((product) => ({ ...product, sample: true, updatedAt: now }));
};

const replaceSamples = (catalog, now) => {
  const kept = withoutSamples(catalog.products);
  const added = seedProducts(kept, now);
  return { products: [...kept, ...added], result: { count: added.length, slugs: [...catalog.products, ...added].map((product) => product.slug) } };
};

const loadSamples = async (context) => {
  const body = await readOptionalJson(context.request, BODY_LIMIT_BYTES);
  const now = new Date().toISOString();
  const outcome = await modifyCatalog(
    context.env,
    (catalog) => (!hasNoProducts(catalog) && body.force !== true ? { result: { count: 0, slugs: [], skipped: true } } : replaceSamples(catalog, now)),
    now,
  );
  if (outcome.skipped) return json({ count: 0, skipped: true });
  purgeCatalog(context, { slugs: outcome.slugs });
  return json({ count: outcome.count });
};

export const onRequest = route({ POST: loadSamples });
