import { CACHE_CONTROL, ERROR_CODES, IMAGE_ID_PATTERN } from "../../_lib/contract.js";
import { edgeCached } from "../../_lib/cache.js";
import { errorResponse, route } from "../../_lib/http.js";
import { loadImage } from "../../_lib/images.js";

const imageHeaders = (id, contentType) => ({
  "Content-Type": contentType,
  "Cache-Control": CACHE_CONTROL.image,
  ETag: `"${id}"`,
});

const matchesEtag = (request, id) => (request.headers.get("If-None-Match") ?? "").includes(`"${id}"`);

const imageResponse = async (env, id) => {
  const { value, metadata } = await loadImage(env, id);
  if (!value) return errorResponse(ERROR_CODES.notFound, "Photo not found.");
  return new Response(value, { headers: imageHeaders(id, metadata?.contentType ?? "image/webp") });
};

const serveImage = async (context) => {
  const { request, env, params } = context;
  const id = String(params.id);
  if (!IMAGE_ID_PATTERN.test(id)) return errorResponse(ERROR_CODES.notFound, "Photo not found.");
  if (matchesEtag(request, id)) return new Response(null, { status: 304, headers: imageHeaders(id, "image/webp") });
  const key = `${new URL(request.url).origin}/api/img/${id}`;
  return edgeCached(context, key, () => imageResponse(env, id));
};

export const onRequest = route({ GET: serveImage, HEAD: serveImage });
