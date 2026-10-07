import { json, noContent, readJson, route } from "../../../_lib/http.js";
import {
  deleteProducts, patchProduct, purgeCatalog, requireProductBody, updateProduct,
} from "../../../_lib/product-service.js";

const PRODUCT_BODY_LIMIT_BYTES = 64 * 1024;

const replace = async (context) => {
  const body = requireProductBody(await readJson(context.request, PRODUCT_BODY_LIMIT_BYTES));
  const { product, slugs } = await updateProduct(context.env, String(context.params.id), body);
  purgeCatalog(context, { slugs });
  return json(product);
};

const quickToggle = async (context) => {
  const body = requireProductBody(await readJson(context.request, PRODUCT_BODY_LIMIT_BYTES));
  const { product, slugs } = await patchProduct(context.env, String(context.params.id), body);
  purgeCatalog(context, { slugs });
  return json(product);
};

const remove = async (context) => {
  const { slugs, imageIds } = await deleteProducts(context.env, new Set([String(context.params.id)]));
  purgeCatalog(context, { slugs, imageIds });
  return noContent();
};

export const onRequest = route({ PUT: replace, PATCH: quickToggle, DELETE: remove });
