import { sessionBody } from "../../_lib/contract.js";
import { readSession } from "../../_lib/auth.js";
import { json, route } from "../../_lib/http.js";

const currentSession = async ({ request, env }) => {
  const session = await readSession(request, env);
  return json(sessionBody(session.expiresAt));
};

export const onRequest = route({ GET: currentSession });
