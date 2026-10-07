import { ERROR_CODES, ROUTES, SESSION } from "../../_lib/contract.js";
import { isAdminConfigured, readSession } from "../../_lib/auth.js";
import { errorResponse, hasCsrfHeader, hasMatchingOrigin, withHeaders } from "../../_lib/http.js";

const NO_STORE = { "Cache-Control": "no-store" };
const SAFE_METHODS = ["GET", "HEAD"];

const isLogin = (url) => url.pathname === ROUTES.admin.login;

const isMutation = (request) => !SAFE_METHODS.includes(request.method);

const rejection = (code, message) => errorResponse(code, message, undefined, NO_STORE);

const crossSiteRejection = (request) =>
  isMutation(request) && !(hasMatchingOrigin(request) && hasCsrfHeader(request))
    ? rejection(ERROR_CODES.forbidden, `Missing ${SESSION.csrfHeader} header or origin mismatch.`)
    : null;

const guard = async ({ request, env, next }) => {
  const url = new URL(request.url);
  if (!isAdminConfigured(env)) return rejection(ERROR_CODES.adminNotConfigured, "Admin is not set up yet.");
  if (isLogin(url)) return hasMatchingOrigin(request) ? next() : rejection(ERROR_CODES.forbidden, "Origin mismatch.");
  if (!(await readSession(request, env))) return rejection(ERROR_CODES.unauthorized, "Please log in.");
  return crossSiteRejection(request) ?? next();
};

export const onRequest = async (context) => withHeaders(await guard(context), NO_STORE);
