import { ERROR_CODES } from "../../../_lib/contract.js";
import { fail, json, readJson, requireSameOrigin, route } from "../../../_lib/http.js";
import { loadCatalog } from "../../../_lib/kv.js";
import { deleteProducts, purgeCatalog, requireProductBody } from "../../../_lib/product-service.js";

const BODY_LIMIT_BYTES = 16 * 1024;
const MAX_IDS = 200;

const isSampleRequest = (body) => body.ids === "sample" || body.sample === true;

const idsToDelete = async (env, body) => {
  if (isSampleRequest(body)) {
    const catalog = await loadCatalog(env);
    return new Set(catalog.products.filter((product) => product.sample).map((product) => product.id));
  }
  const valid = Array.isArray(body.ids) && body.ids.length <= MAX_IDS && body.ids.every((id) => typeof id === "string");
  return valid ? new Set(body.ids) : fail(ERROR_CODES.badRequest, "Send ids as a list of product ids or \"sample\".");
};

const bulkDelete = async (context) => {
  requireSameOrigin(context.request);
  const body = requireProductBody(await readJson(context.request, BODY_LIMIT_BYTES));
  const { count, slugs, imageIds } = await deleteProducts(context.env, await idsToDelete(context.env, body));
  purgeCatalog(context, { slugs, imageIds });
  return json({ deleted: count });
};

export const onRequest = route({ POST: bulkDelete });
