import { NOTIFY_CSV_HEADER, csvResponse, notifyCsvRow, toCsv } from "../../_lib/csv.js";
import { route } from "../../_lib/http.js";
import { listSignupEntries } from "./notify.js";

const exportSignups = async ({ env }) => {
  const entries = await listSignupEntries(env);
  return csvResponse(toCsv(NOTIFY_CSV_HEADER, entries.map(notifyCsvRow)), "chashmagenie-notify-list.csv");
};

export const onRequest = route({ GET: exportSignups });
