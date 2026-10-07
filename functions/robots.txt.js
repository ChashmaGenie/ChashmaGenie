import { CACHE_CONTROL } from "./_lib/contract.js";
import { route } from "./_lib/http.js";
import { buildRobots } from "./_lib/xml.js";

const serveRobots = ({ request }) =>
  new Response(buildRobots(new URL(request.url).origin), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": CACHE_CONTROL.robots },
  });

export const onRequest = route({ GET: serveRobots, HEAD: serveRobots });
