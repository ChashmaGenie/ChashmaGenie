import { json, route } from "../../../_lib/http.js";
import { listQuoteEntries } from "../../../_lib/quote-service.js";

const listQuotes = async ({ request, env }) => {
  const status = new URL(request.url).searchParams.get("status");
  const entries = await listQuoteEntries(env);
  return json({ quotes: status ? entries.filter((entry) => entry.status === status) : entries });
};

export const onRequest = route({ GET: listQuotes });
