import { HTTP } from "./_lib/contract.js";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const withSecurityHeaders = (response) => {
  const headers = new Headers(response.headers);
  Object.entries(SECURITY_HEADERS).forEach(([name, value]) => {
    if (!headers.has(name)) headers.set(name, value);
  });
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};

const preflightResponse = () =>
  new Response(null, { status: HTTP.noContent, headers: { Allow: "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS" } });

export const onRequest = async ({ request, next }) =>
  request.method === "OPTIONS" ? withSecurityHeaders(preflightResponse()) : withSecurityHeaders(await next());
