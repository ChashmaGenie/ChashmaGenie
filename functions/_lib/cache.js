const cacheKey = (url) => new Request(url, { method: "GET" });

export const publicKey = (request, pathname) => `${new URL(request.url).origin}${pathname}`;

export const edgeCached = async ({ request, waitUntil }, key, produce) => {
  const cache = caches.default;
  const hit = await cache.match(cacheKey(key));
  if (hit) return hit;
  const response = await produce();
  if (response.ok) waitUntil(cache.put(cacheKey(key), response.clone()));
  return response;
};

export const purgeEdge = (request, pathnames) =>
  Promise.allSettled(pathnames.map((pathname) => caches.default.delete(cacheKey(publicKey(request, pathname)))));
