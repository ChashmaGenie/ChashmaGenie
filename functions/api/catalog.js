import { CACHE_CONTROL, ROUTES, catalogBody } from "../_lib/contract.js";
import { edgeCached, publicKey } from "../_lib/cache.js";
import { json, route } from "../_lib/http.js";
import { loadCatalog } from "../_lib/kv.js";

const isVisible = (product) => product.visible !== false;

const publicCatalogResponse = async (env) => {
  const catalog = await loadCatalog(env, { cached: true });
  return json(catalogBody(catalog.products.filter(isVisible), catalog.updatedAt), 200, {
    "Cache-Control": CACHE_CONTROL.publicData,
  });
};

export const onRequest = route({
  GET: (context) =>
    edgeCached(context, publicKey(context.request, ROUTES.catalog), () => publicCatalogResponse(context.env)),
  HEAD: (context) =>
    edgeCached(context, publicKey(context.request, ROUTES.catalog), () => publicCatalogResponse(context.env)),
});
