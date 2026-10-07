import { LIMITS } from "../../../_lib/contract.js";
import { uploadedImageIds } from "../../../_lib/catalog-ops.js";
import { json, route } from "../../../_lib/http.js";
import { deleteImages, findUnusedImageIds } from "../../../_lib/images.js";
import { loadCatalog } from "../../../_lib/kv.js";
import { purgeCatalog } from "../../../_lib/product-service.js";

const removeUnusedPhotos = async (context) => {
  const catalog = await loadCatalog(context.env);
  const unused = await findUnusedImageIds(context.env, uploadedImageIds(catalog.products));
  const batch = unused.slice(0, LIMITS.orphanPhotosPerRequest);
  await deleteImages(context.env, batch);
  purgeCatalog(context, { imageIds: batch });
  return json({ removed: batch.length, remaining: unused.length - batch.length });
};

export const onRequest = route({ POST: removeUnusedPhotos });
