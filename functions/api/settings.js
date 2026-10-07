import { CACHE_CONTROL, ROUTES } from "../_lib/contract.js";
import { edgeCached, publicKey } from "../_lib/cache.js";
import { json, route } from "../_lib/http.js";
import { loadSettings } from "../_lib/kv.js";

const settingsResponse = async (env) =>
  json(await loadSettings(env, { cached: true }), 200, { "Cache-Control": CACHE_CONTROL.publicData });

const serveSettings = (context) =>
  edgeCached(context, publicKey(context.request, ROUTES.settings), () => settingsResponse(context.env));

export const onRequest = route({ GET: serveSettings, HEAD: serveSettings });
