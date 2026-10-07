import { ERROR_CODES, ERROR_STATUS, HTTP, SESSION, errorBody } from "./contract.js";

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

export class ApiError extends Error {
  constructor(code, message, fields, headers) {
    super(message);
    this.code = code;
    this.fields = fields;
    this.headers = headers;
  }
}

export const json = (body, status = HTTP.ok, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...headers } });

export const noContent = (headers = {}) => new Response(null, { status: HTTP.noContent, headers });

export const errorResponse = (code, message, fields, headers = {}) =>
  json(errorBody(code, message, fields), ERROR_STATUS[code] ?? HTTP.badRequest, headers);

export const fail = (code, message, fields, headers) => {
  throw new ApiError(code, message, fields, headers);
};

const toErrorResponse = (error) =>
  error instanceof ApiError
    ? errorResponse(error.code, error.message, error.fields, error.headers)
    : json(errorBody("internal_error", "Something went wrong. Please try again."), 500);

export const route = (handlers) => async (context) => {
  const handler = handlers[context.request.method];
  const allowed = Object.keys(handlers).join(", ");
  if (!handler) return json(errorBody(ERROR_CODES.badRequest, "Method not allowed."), 405, { Allow: allowed });
  try {
    return await handler(context);
  } catch (error) {
    return toErrorResponse(error);
  }
};

export const withHeaders = (response, extraHeaders) => {
  const headers = new Headers(response.headers);
  Object.entries(extraHeaders).forEach(([name, value]) => headers.set(name, value));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};

export const isLocalHost = (url) => ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

export const hasMatchingOrigin = (request) => {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
};

export const requireSameOrigin = (request) => {
  if (!hasMatchingOrigin(request)) fail(ERROR_CODES.forbidden, "Cross-site requests are not allowed.");
};

export const hasCsrfHeader = (request) => request.headers.get(SESSION.csrfHeader) === SESSION.csrfValue;

const declaredLength = (request) => Number(request.headers.get("Content-Length") ?? 0);

export const readBytes = async (request, maxBytes) => {
  if (declaredLength(request) > maxBytes) fail(ERROR_CODES.payloadTooLarge, "That upload is too large.");
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > maxBytes) fail(ERROR_CODES.payloadTooLarge, "That upload is too large.");
  return bytes;
};

const isJsonRequest = (request) => (request.headers.get("Content-Type") ?? "").toLowerCase().includes("application/json");

export const readJson = async (request, maxBytes) => {
  if (!isJsonRequest(request)) fail(ERROR_CODES.unsupportedMedia, "Send JSON with Content-Type application/json.");
  const bytes = await readBytes(request, maxBytes);
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return fail(ERROR_CODES.badRequest, "The request body is not valid JSON.");
  }
};

export const readOptionalJson = async (request, maxBytes) => {
  const bytes = await readBytes(request, maxBytes);
  if (bytes.byteLength === 0) return {};
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return fail(ERROR_CODES.badRequest, "The request body is not valid JSON.");
  }
};

export const clientIp = (request) => request.headers.get("CF-Connecting-IP") ?? "";

export const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
