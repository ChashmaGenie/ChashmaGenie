import { CACHE_CONTROL, ROUTES } from "./_lib/contract.js";
import { edgeCached, publicKey } from "./_lib/cache.js";
import { route } from "./_lib/http.js";
import { loadCatalogOrSamples } from "./_lib/kv.js";
import { buildSitemap } from "./_lib/xml.js";

const sitemapResponse = async (request, env) => {
  const catalog = await loadCatalogOrSamples(env, { cached: true });
  return new Response(buildSitemap(new URL(request.url).origin, catalog.products), {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": CACHE_CONTROL.sitemap },
  });
};

const serveSitemap = (context) =>
  edgeCached(context, publicKey(context.request, ROUTES.sitemap), () => sitemapResponse(context.request, context.env));

export const onRequest = route({ GET: serveSitemap, HEAD: serveSitemap });
