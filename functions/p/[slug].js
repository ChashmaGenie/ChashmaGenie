import { CACHE_CONTROL, HTTP } from "../_lib/contract.js";
import { edgeCached, publicKey } from "../_lib/cache.js";
import { route } from "../_lib/http.js";
import { loadCatalogOrSamples } from "../_lib/kv.js";
import { rewriteProductPage } from "../_lib/og.js";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REWRITE_HEADERS_TO_DROP = ["Content-Length", "ETag", "Last-Modified"];

const fetchShell = (env, url) => env.ASSETS.fetch(new Request(new URL("/", url), { headers: { Accept: "text/html" } }));

const shellHeaders = (shell) => {
  const headers = new Headers(shell.headers);
  REWRITE_HEADERS_TO_DROP.forEach((name) => headers.delete(name));
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Cache-Control", CACHE_CONTROL.productPage);
  return headers;
};

const asHtmlPage = (shell, body) => new Response(body, { status: 200, headers: shellHeaders(shell) });

const missingProductPage = (shell) => {
  const headers = shellHeaders(shell);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("Cache-Control", CACHE_CONTROL.noStore);
  return new Response(shell.body, { status: HTTP.notFound, headers });
};

const findVisibleProduct = async (env, slug) => {
  if (!SLUG_PATTERN.test(slug)) return null;
  const catalog = await loadCatalogOrSamples(env, { cached: true });
  return catalog.products.find((product) => product.slug === slug && product.visible !== false) ?? null;
};

const productPage = async ({ request, env, params }) => {
  const url = new URL(request.url);
  const shell = await fetchShell(env, url);
  const product = await findVisibleProduct(env, String(params.slug));
  if (!product) return missingProductPage(shell);
  if (typeof HTMLRewriter === "undefined") return asHtmlPage(shell, shell.body);
  const rewritten = rewriteProductPage(shell, url.origin, product);
  return asHtmlPage(shell, rewritten.body);
};

const servePage = (context) => edgeCached(context, publicKey(context.request, new URL(context.request.url).pathname), () => productPage(context));

export const onRequest = route({ GET: servePage, HEAD: servePage });
