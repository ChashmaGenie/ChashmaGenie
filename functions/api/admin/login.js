import { ERROR_CODES, LIMITS, sessionBody } from "../../_lib/contract.js";
import { createDeviceToken, createSessionToken, deviceCookie, isTrustedDevice, passwordIsCorrect, sessionCookie } from "../../_lib/auth.js";
import { fail, readJson, route } from "../../_lib/http.js";
import { clearLoginFailures, hashClient, reserveLoginAttempt } from "../../_lib/rate.js";

const LOGIN_BODY_LIMIT_BYTES = 1024;

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const rejectBadPassword = async () => {
  await pause(LIMITS.loginFailureDelayMs);
  return fail(ERROR_CODES.invalidCredentials, "That password didn't work.");
};

const login = async ({ request, env }) => {
  const url = new URL(request.url);
  const knownDevice = await isTrustedDevice(request, env);
  const ipHash = await hashClient(request, env);
  if (!knownDevice) await reserveLoginAttempt(env, ipHash);
  const body = await readJson(request, LOGIN_BODY_LIMIT_BYTES);
  if (!(await passwordIsCorrect(body?.password, env))) return rejectBadPassword();
  if (!knownDevice) await clearLoginFailures(env, ipHash);
  const { token, expiresAt } = await createSessionToken(env);
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8" });
  headers.append("Set-Cookie", sessionCookie(token, url));
  headers.append("Set-Cookie", deviceCookie(await createDeviceToken(env), url));
  return new Response(JSON.stringify(sessionBody(expiresAt)), { status: 200, headers });
};

export const onRequest = route({ POST: login });
