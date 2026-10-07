import { ERROR_CODES, ROUTES } from "../../_lib/contract.js";
import { purgeEdge } from "../../_lib/cache.js";
import { fail, json, readJson, route } from "../../_lib/http.js";
import { loadSettings, saveSettings } from "../../_lib/kv.js";
import { validateSettings } from "../../../shared/schema.js";

const SETTINGS_BODY_LIMIT_BYTES = 32 * 1024;

const getSettings = async ({ env }) => json(await loadSettings(env));

const updateSettings = async ({ request, env, waitUntil }) => {
  const incoming = await readJson(request, SETTINGS_BODY_LIMIT_BYTES);
  const check = validateSettings({ ...(await loadSettings(env)), ...incoming });
  if (!check.ok) fail(ERROR_CODES.validation, "Please check the highlighted fields.", check.errors);
  await saveSettings(env, check.value);
  waitUntil(purgeEdge(request, [ROUTES.settings]));
  return json(check.value);
};

export const onRequest = route({ GET: getSettings, PUT: updateSettings });
