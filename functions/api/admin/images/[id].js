import { ERROR_CODES, IMAGE_ID_PATTERN, ROUTES } from "../../../_lib/contract.js";
import { isImageReferenced } from "../../../_lib/catalog-ops.js";
import { purgeEdge } from "../../../_lib/cache.js";
import { fail, noContent, route } from "../../../_lib/http.js";
import { deleteImages } from "../../../_lib/images.js";
import { loadCatalog } from "../../../_lib/kv.js";

const remove = async ({ request, env, params, waitUntil }) => {
  const id = String(params.id);
  if (!IMAGE_ID_PATTERN.test(id)) fail(ERROR_CODES.notFound, "Photo not found.");
  const catalog = await loadCatalog(env);
  if (isImageReferenced(catalog.products, id)) fail(ERROR_CODES.imageInUse, "That photo is still used by a product.");
  await deleteImages(env, [id]);
  waitUntil(purgeEdge(request, [ROUTES.image(id)]));
  return noContent();
};

export const onRequest = route({ DELETE: remove });
