import { HTTP, LIMITS, imageUploadedBody } from "../../../_lib/contract.js";
import { json, readBytes, route } from "../../../_lib/http.js";
import { assertAcceptableImage, storeImage } from "../../../_lib/images.js";
import { makeImageId } from "../../../_lib/ids.js";

const upload = async ({ request, env }) => {
  const bytes = await readBytes(request, LIMITS.imageBytes);
  const contentType = assertAcceptableImage(bytes, request.headers.get("Content-Type"));
  const id = makeImageId();
  await storeImage(env, id, bytes, contentType);
  return json(imageUploadedBody(id, bytes.byteLength), HTTP.created);
};

export const onRequest = route({ POST: upload });
