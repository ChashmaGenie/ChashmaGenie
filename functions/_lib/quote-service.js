import { ERROR_CODES, KV_KEYS, LIMITS, QUOTE_ID_PATTERN, quoteIndexEntry } from "./contract.js";
import { fail } from "./http.js";
import { absoluteExpiration, listMetadata, readJson, removeKey, writeWithMetadata } from "./kv.js";
import { QUOTE_STATUS, isOneOf } from "../../shared/enums.js";

const OWNER_NOTES_LIMIT = 2000;

export const assertQuoteId = (id) => {
  if (!QUOTE_ID_PATTERN.test(id)) fail(ERROR_CODES.notFound, "Quote not found.");
  return id;
};

export const loadQuote = async (env, id) =>
  (await readJson(env, KV_KEYS.quote(assertQuoteId(id)))) ?? fail(ERROR_CODES.notFound, "Quote not found.");

const parsePatch = (body) => {
  const errors = {};
  if (body.status !== undefined && !isOneOf(QUOTE_STATUS, body.status)) errors.status = "Choose a valid status.";
  if (body.ownerNotes !== undefined && typeof body.ownerNotes !== "string") errors.ownerNotes = "Notes must be text.";
  if (Object.keys(errors).length > 0) fail(ERROR_CODES.validation, "Invalid change.", errors);
  return {
    ...(body.status !== undefined ? { status: body.status } : {}),
    ...(body.ownerNotes !== undefined ? { ownerNotes: body.ownerNotes.trim().slice(0, OWNER_NOTES_LIMIT) } : {}),
  };
};

const applyPatch = (quote, patch, now) => ({
  ...quote,
  ...patch,
  statusUpdatedAt: patch.status && patch.status !== quote.status ? now : quote.statusUpdatedAt,
});

export const storeQuote = (env, quote) =>
  writeWithMetadata(env, KV_KEYS.quote(quote.id), quote, quoteIndexEntry(quote), {
    expiration: absoluteExpiration(quote.createdAt, LIMITS.quoteTtlSeconds),
  });

export const patchQuote = async (env, id, body, now = new Date().toISOString()) => {
  const patch = parsePatch(body);
  const updated = applyPatch(await loadQuote(env, id), patch, now);
  await storeQuote(env, updated);
  return updated;
};

export const deleteQuote = (env, id) => removeKey(env, KV_KEYS.quote(assertQuoteId(id)));

const newestFirst = (left, right) => right.createdAt.localeCompare(left.createdAt);

export const listQuoteEntries = async (env) =>
  (await listMetadata(env, KV_KEYS.quotePrefix, LIMITS.quoteListMax)).sort(newestFirst);
