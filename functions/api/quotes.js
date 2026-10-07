import { ERROR_CODES, HTTP, KV_KEYS, LIMITS, quoteCreatedBody } from "../_lib/contract.js";
import { fail, isPlainObject, json, readJson, requireSameOrigin, route } from "../_lib/http.js";
import { loadCatalogOrSamples } from "../_lib/kv.js";
import { makeQuoteId } from "../_lib/ids.js";
import { enforceQuoteRate } from "../_lib/rate.js";
import { buildQuote } from "../_lib/quote-builder.js";
import { storeQuote } from "../_lib/quote-service.js";
import { validateQuoteInput } from "../../shared/schema.js";

const MAX_ID_ATTEMPTS = 4;

const decoyCreatedBody = () => quoteCreatedBody({ id: makeQuoteId(), createdAt: new Date().toISOString() });

const pickUnusedId = async (env) => {
  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt += 1) {
    const id = makeQuoteId();
    if (!(await env.CHASHMA_KV.get(KV_KEYS.quote(id)))) return id;
  }
  return fail(ERROR_CODES.conflict, "Please try again.");
};

const createQuote = async ({ request, env }) => {
  requireSameOrigin(request);
  const body = await readJson(request, LIMITS.quoteBodyBytes);
  if (!isPlainObject(body)) fail(ERROR_CODES.badRequest, "The request body must be an object.");
  const check = validateQuoteInput(body);
  if (check.value.website) return json(decoyCreatedBody(), HTTP.created);
  if (!check.ok) fail(ERROR_CODES.validation, "Please check the highlighted fields.", check.errors);
  const catalog = await loadCatalogOrSamples(env, { cached: true });
  const built = buildQuote({
    input: check.value,
    catalog,
    id: await pickUnusedId(env),
    now: new Date().toISOString(),
    userAgent: request.headers.get("User-Agent"),
  });
  if (!built.quote) fail(ERROR_CODES.validation, "Please check the highlighted fields.", built.errors);
  await enforceQuoteRate(env, request);
  await storeQuote(env, built.quote);
  return json(quoteCreatedBody(built.quote), HTTP.created);
};

export const onRequest = route({ POST: createQuote });
