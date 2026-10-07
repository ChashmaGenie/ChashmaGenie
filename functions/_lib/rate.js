import { ERROR_CODES, KV_KEYS, LIMITS } from "./contract.js";
import { sha256Hex } from "./crypto.js";
import { clientIp, fail } from "./http.js";
import { withKeyLock } from "./keyed-lock.js";
import { readJson, removeKey, writeJson } from "./kv.js";

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const UNKNOWN_CLIENT = "unknown";

export const hashClient = async (request, env) => {
  const ip = clientIp(request) || UNKNOWN_CLIENT;
  return (await sha256Hex(`${ip}${env.SESSION_SECRET ?? ""}`)).slice(0, 16);
};

const hourBucket = (nowMs) => Math.floor(nowMs / 1000 / SECONDS_PER_HOUR);

const dayBucket = (nowMs) => Math.floor(nowMs / 1000 / SECONDS_PER_DAY);

const secondsLeft = (windowStartMs, windowSeconds, nowMs) =>
  Math.max(1, Math.ceil((windowStartMs + windowSeconds * 1000 - nowMs) / 1000));

const rateLimited = (retryAfterSeconds) =>
  fail(ERROR_CODES.rateLimited, "Too many attempts. Please try again later.", undefined, {
    "Retry-After": String(retryAfterSeconds),
  });

const isWindowOpen = (record, nowMs) => Boolean(record) && nowMs < record.windowStart + LIMITS.loginWindowSeconds * 1000;

export const reserveLoginAttempt = (env, ipHash, nowMs = Date.now()) =>
  withKeyLock(KV_KEYS.loginAttempts(ipHash), async () => {
    const key = KV_KEYS.loginAttempts(ipHash);
    const stored = await readJson(env, key);
    const record = isWindowOpen(stored, nowMs) ? stored : { count: 0, windowStart: nowMs };
    if (record.count >= LIMITS.loginFailuresAllowed) {
      rateLimited(secondsLeft(record.windowStart, LIMITS.loginWindowSeconds, nowMs));
    }
    const ttl = Math.max(60, secondsLeft(record.windowStart, LIMITS.loginWindowSeconds, nowMs));
    await writeJson(env, key, { ...record, count: record.count + 1 }, { expirationTtl: ttl });
  });

export const clearLoginFailures = (env, ipHash) =>
  withKeyLock(KV_KEYS.loginAttempts(ipHash), () => removeKey(env, KV_KEYS.loginAttempts(ipHash)));

const claimToken = () => globalThis.crypto.randomUUID();

const claimSlotWithVerification = async (env, slotKeys, token) => {
  const occupants = await Promise.all(slotKeys.map((key) => env.CHASHMA_KV.get(key)));
  const freeKeys = slotKeys.filter((_, index) => occupants[index] === null);
  for (const key of freeKeys) {
    await env.CHASHMA_KV.put(key, token, { expirationTtl: LIMITS.rateKeyTtlSeconds });
    if ((await env.CHASHMA_KV.get(key)) === token) return true;
  }
  return false;
};

const slotKeysFor = (keyFor, ipHash, bucket, limit) =>
  Array.from({ length: limit }, (_, slot) => keyFor(ipHash, bucket, slot));

const incrementDailyTotal = (env, dailyKeyFor, cap, nowMs) => {
  const key = dailyKeyFor(dayBucket(nowMs));
  return withKeyLock(key, async () => {
    const used = Number(await env.CHASHMA_KV.get(key)) || 0;
    if (used >= cap) rateLimited(SECONDS_PER_DAY - (Math.floor(nowMs / 1000) % SECONDS_PER_DAY));
    await env.CHASHMA_KV.put(key, String(used + 1), { expirationTtl: LIMITS.dailyKeyTtlSeconds });
  });
};

const submissionLimiter = ({ slotKeyFor, perHour, dailyKeyFor, perDay }) => async (env, request, nowMs = Date.now()) => {
  if (!clientIp(request)) return incrementDailyTotal(env, dailyKeyFor, perDay, nowMs);
  const ipHash = await hashClient(request, env);
  const slotKeys = slotKeysFor(slotKeyFor, ipHash, hourBucket(nowMs), perHour);
  const claimed = await withKeyLock(slotKeys[0], () => claimSlotWithVerification(env, slotKeys, claimToken()));
  if (!claimed) rateLimited(SECONDS_PER_HOUR - (Math.floor(nowMs / 1000) % SECONDS_PER_HOUR));
  await incrementDailyTotal(env, dailyKeyFor, perDay, nowMs);
};

export const enforceQuoteRate = submissionLimiter({
  slotKeyFor: KV_KEYS.quoteRate,
  perHour: LIMITS.quoteRatePerHour,
  dailyKeyFor: KV_KEYS.quoteDailyTotal,
  perDay: LIMITS.quotesPerDay,
});

export const enforceNotifyRate = submissionLimiter({
  slotKeyFor: KV_KEYS.notifyRate,
  perHour: LIMITS.notifyRatePerHour,
  dailyKeyFor: KV_KEYS.notifyDailyTotal,
  perDay: LIMITS.notifySignupsPerDay,
});
