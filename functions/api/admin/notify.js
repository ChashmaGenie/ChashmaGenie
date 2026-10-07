import { KV_KEYS, LIMITS } from "../../_lib/contract.js";
import { json, route } from "../../_lib/http.js";
import { listMetadata } from "../../_lib/kv.js";

export const listSignupEntries = async (env) =>
  (await listMetadata(env, KV_KEYS.notifyPrefix, LIMITS.notifyListMax)).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );

const listSignups = async ({ env }) => {
  const entries = await listSignupEntries(env);
  return json({ entries, count: entries.length });
};

export const onRequest = route({ GET: listSignups });
