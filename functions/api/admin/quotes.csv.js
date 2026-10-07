import { KV_KEYS } from "../../_lib/contract.js";
import { listQuoteEntries } from "../../_lib/quote-service.js";
import { QUOTE_CSV_HEADER, csvResponse, quoteCsvRow, toCsv } from "../../_lib/csv.js";
import { route } from "../../_lib/http.js";
import { readJson } from "../../_lib/kv.js";

const EXPORT_BATCH_SIZE = 45;

const requestedOffset = (request) => Math.max(0, Number(new URL(request.url).searchParams.get("offset")) || 0);

const exportQuotes = async ({ request, env }) => {
  const index = await listQuoteEntries(env);
  const offset = requestedOffset(request);
  const batch = index.slice(offset, offset + EXPORT_BATCH_SIZE);
  const quotes = (await Promise.all(batch.map((entry) => readJson(env, KV_KEYS.quote(entry.id))))).filter(Boolean);
  const nextOffset = offset + batch.length;
  return csvResponse(toCsv(QUOTE_CSV_HEADER, quotes.map(quoteCsvRow)), "chashmagenie-quotes.csv", {
    "X-Total-Quotes": String(index.length),
    "X-Next-Offset": nextOffset < index.length ? String(nextOffset) : "",
  });
};

export const onRequest = route({ GET: exportQuotes });
