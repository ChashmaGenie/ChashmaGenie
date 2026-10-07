import { clearedSessionCookie, revokeAllSessions } from "../../_lib/auth.js";
import { json, route } from "../../_lib/http.js";

const logout = async ({ request, env }) => {
  await revokeAllSessions(env);
  return json({ ok: true }, 200, { "Set-Cookie": clearedSessionCookie(new URL(request.url)) });
};

export const onRequest = route({ POST: logout });
