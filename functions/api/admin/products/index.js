import { HTTP } from "../../../_lib/contract.js";
import { json, readJson, route } from "../../../_lib/http.js";
import { createProduct, purgeCatalog, requireProductBody } from "../../../_lib/product-service.js";

const PRODUCT_BODY_LIMIT_BYTES = 64 * 1024;

const create = async (context) => {
  const body = requireProductBody(await readJson(context.request, PRODUCT_BODY_LIMIT_BYTES));
  const { product, slugs } = await createProduct(context.env, body);
  purgeCatalog(context, { slugs });
  return json(product, HTTP.created);
};

export const onRequest = route({ POST: create });
