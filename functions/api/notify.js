import { ERROR_CODES, HTTP, KV_KEYS, LIMITS } from "../_lib/contract.js";
import { sha256Hex } from "../_lib/crypto.js";
import { fail, json, readJson, requireSameOrigin, route } from "../_lib/http.js";
import { writeWithMetadata } from "../_lib/kv.js";
import { enforceNotifyRate } from "../_lib/rate.js";
import { validateNotifyInput } from "../../shared/schema.js";

const ACCEPTED = { ok: true };
const BODY_LIMIT_BYTES = 2048;
const CONTACT_HASH_LENGTH = 32;

const signupKey = async (contact) => KV_KEYS.notify((await sha256Hex(contact)).slice(0, CONTACT_HASH_LENGTH));

const alreadySignedUp = async (env, key) => (await env.CHASHMA_KV.get(key)) !== null;

const acceptSignup = async (context) => {
  const { request, env } = context;
  requireSameOrigin(request);
  const check = validateNotifyInput(await readJson(request, BODY_LIMIT_BYTES));
  if (check.value.website) return json(ACCEPTED, HTTP.created);
  if (!check.ok) fail(ERROR_CODES.validation, "Please check your details.", check.errors);
  const key = await signupKey(check.value.contact);
  if (await alreadySignedUp(env, key)) return json(ACCEPTED, HTTP.created);
  await enforceNotifyRate(env, request);
  const entry = { contact: check.value.contact, kind: check.value.kind, createdAt: new Date().toISOString() };
  await writeWithMetadata(env, key, entry, entry, { expirationTtl: LIMITS.notifyTtlSeconds });
  return json(ACCEPTED, HTTP.created);
};

export const onRequest = route({ POST: acceptSignup });
