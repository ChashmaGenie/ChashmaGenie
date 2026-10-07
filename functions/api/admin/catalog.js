import { json, route } from "../../_lib/http.js";
import { loadCatalog } from "../../_lib/kv.js";

export const onRequest = route({ GET: async ({ env }) => json(await loadCatalog(env)) });
