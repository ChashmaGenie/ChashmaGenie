import { KV_KEYS, SESSION } from "./contract.js";
import { passwordMatches, signHmac, toBase64Url, verifyHmac } from "./crypto.js";
import { isLocalHost } from "./http.js";
import { readJson, writeJson } from "./kv.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const isAdminConfigured = (env) => Boolean(env.ADMIN_PASSWORD && env.SESSION_SECRET);

export const passwordIsCorrect = (candidate, env) =>
  typeof candidate === "string" && candidate.length > 0 && candidate.length <= 200
    ? passwordMatches(candidate, env.ADMIN_PASSWORD)
    : Promise.resolve(false);

const signingSecret = (env) => `${env.SESSION_SECRET}:${env.ADMIN_PASSWORD}`;

const newNonce = () => toBase64Url(globalThis.crypto.getRandomValues(new Uint8Array(12)));

const encodePayload = (payload) => toBase64Url(encoder.encode(JSON.stringify(payload)));

const decodePayload = (encoded) => {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
    return JSON.parse(decoder.decode(Uint8Array.from(binary, (char) => char.charCodeAt(0))));
  } catch {
    return null;
  }
};

const signPayload = async (env, payload) => {
  const encoded = encodePayload({ ...payload, nonce: newNonce() });
  return `${encoded}.${await signHmac(signingSecret(env), encoded)}`;
};

const verifiedPayload = async (env, token) => {
  const [encoded, signature, ...rest] = token.split(".");
  if (!encoded || !signature || rest.length > 0) return null;
  if (!(await verifyHmac(signingSecret(env), encoded, signature))) return null;
  return decodePayload(encoded);
};

const readCookie = (request, name) => {
  const header = request.headers.get("Cookie") ?? "";
  const pair = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return pair ? pair.slice(name.length + 1) : "";
};

export const createSessionToken = async (env, nowMs = Date.now()) => {
  const expiresAtMs = nowMs + SESSION.maxAgeSeconds * 1000;
  const token = await signPayload(env, { exp: Math.floor(expiresAtMs / 1000), iat: nowMs });
  return { token, expiresAt: new Date(expiresAtMs).toISOString() };
};

const isExpired = (decoded, nowMs) => !Number.isFinite(decoded.exp) || decoded.exp * 1000 <= nowMs;

const readRevokedBefore = async (env) => Number(await readJson(env, KV_KEYS.sessionsRevokedBefore)) || 0;

export const readSession = async (request, env, nowMs = Date.now()) => {
  const decoded = await verifiedPayload(env, readCookie(request, SESSION.cookieName));
  if (!decoded || isExpired(decoded, nowMs)) return null;
  if (!Number.isFinite(decoded.iat) || decoded.iat <= (await readRevokedBefore(env))) return null;
  return { expiresAt: new Date(decoded.exp * 1000).toISOString() };
};

export const revokeAllSessions = (env, nowMs = Date.now()) => writeJson(env, KV_KEYS.sessionsRevokedBefore, nowMs);

export const createDeviceToken = (env, nowMs = Date.now()) =>
  signPayload(env, { kind: "device", exp: Math.floor(nowMs / 1000) + SESSION.deviceMaxAgeSeconds });

export const isTrustedDevice = async (request, env, nowMs = Date.now()) => {
  const decoded = await verifiedPayload(env, readCookie(request, SESSION.deviceCookieName));
  return Boolean(decoded) && decoded.kind === "device" && !isExpired(decoded, nowMs);
};

const cookieAttributes = (url, maxAge) =>
  ["Path=/", "HttpOnly", "SameSite=Strict", `Max-Age=${maxAge}`, ...(isLocalHost(url) ? [] : ["Secure"])].join("; ");

export const sessionCookie = (token, url) =>
  `${SESSION.cookieName}=${token}; ${cookieAttributes(url, SESSION.maxAgeSeconds)}`;

export const deviceCookie = (token, url) =>
  `${SESSION.deviceCookieName}=${token}; ${cookieAttributes(url, SESSION.deviceMaxAgeSeconds)}`;

export const clearedSessionCookie = (url) => `${SESSION.cookieName}=; ${cookieAttributes(url, 0)}`;
