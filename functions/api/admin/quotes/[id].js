import { ERROR_CODES } from "../../../_lib/contract.js";
import { fail, isPlainObject, json, noContent, readJson, route } from "../../../_lib/http.js";
import { deleteQuote, loadQuote, patchQuote } from "../../../_lib/quote-service.js";

const PATCH_BODY_LIMIT_BYTES = 8 * 1024;

const show = async ({ env, params }) => json(await loadQuote(env, String(params.id)));

const update = async ({ request, env, params }) => {
  const body = await readJson(request, PATCH_BODY_LIMIT_BYTES);
  if (!isPlainObject(body)) fail(ERROR_CODES.badRequest, "The request body must be an object.");
  return json(await patchQuote(env, String(params.id), body));
};

const remove = async ({ env, params }) => {
  await deleteQuote(env, String(params.id));
  return noContent();
};

export const onRequest = route({ GET: show, PATCH: update, DELETE: remove });
