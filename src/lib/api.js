import { ROUTES, SESSION } from "@functions/_lib/contract.js";

const DEFAULT_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  constructor({ status, code, message, fields, retryAfter }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields ?? {};
    this.retryAfter = retryAfter ?? null;
  }
}

const parseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const toApiError = (response, body) =>
  new ApiError({
    status: response.status,
    code: body?.error ?? "http_error",
    message: body?.message ?? `Request failed (${response.status})`,
    fields: body?.fields,
    retryAfter: Number(response.headers.get("Retry-After")) || null,
  });

const networkError = (error) =>
  new ApiError({
    status: 0,
    code: error?.name === "AbortError" ? "timeout" : "network_error",
    message: error?.name === "AbortError" ? "The request timed out." : "Could not reach the server.",
  });

const buildRequest = ({ method = "GET", body, headers = {}, admin = false, rawBody, signal }) => {
  const jsonHeaders = body === undefined ? {} : { "Content-Type": "application/json" };
  const adminHeaders = admin && method !== "GET" ? { [SESSION.csrfHeader]: SESSION.csrfValue } : {};
  return {
    method,
    headers: { Accept: "application/json", ...jsonHeaders, ...adminHeaders, ...headers },
    body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
    credentials: "same-origin",
    signal,
  };
};

export const fetchJson = async (url, options = {}) => {
  const { timeout = DEFAULT_TIMEOUT_MS, ...requestOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, buildRequest({ ...requestOptions, signal: controller.signal }));
    const body = await parseBody(response);
    if (!response.ok) throw toApiError(response, body);
    return body;
  } catch (error) {
    throw error instanceof ApiError ? error : networkError(error);
  } finally {
    clearTimeout(timer);
  }
};

export const getCatalog = (timeout = 4000) => fetchJson(ROUTES.catalog, { timeout });

export const getSettings = (timeout = 4000) => fetchJson(ROUTES.settings, { timeout });

export const postQuote = (payload) => fetchJson(ROUTES.quotes, { method: "POST", body: payload });

export const postNotify = (payload) => fetchJson(ROUTES.notify, { method: "POST", body: payload });
