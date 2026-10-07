import { ApiError } from "@/lib/api.js";

const MESSAGES_BY_CODE = {
  rate_limited: "Too many tries. Please wait a few minutes and try again.",
  catalog_too_large: "The shop has too many products or text. Delete some old items first.",
  payload_too_large: "That file is too big.",
  image_in_use: "That photo is still used by a product.",
  network_error: "No internet connection. Check your signal and try again.",
  timeout: "This is taking too long. Check your signal and try again.",
  admin_not_configured: "The admin password has not been set up on the server yet.",
  conflict: "Something with the same name already exists. Change the name and try again.",
};

export const friendlyError = (error, fallback = "Something went wrong. Please try again.") => {
  if (!(error instanceof ApiError)) return fallback;
  return MESSAGES_BY_CODE[error.code] ?? (error.status >= 500 ? fallback : error.message || fallback);
};

export const fieldErrorsOf = (error) => (error instanceof ApiError ? error.fields : {});
