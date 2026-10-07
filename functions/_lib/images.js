import { ACCEPTED_IMAGE_TYPES, ERROR_CODES, KV_KEYS, LIMITS } from "./contract.js";
import { fail } from "./http.js";
import { listKeys } from "./kv.js";

const ascii = (bytes, from, to) => String.fromCharCode(...bytes.slice(from, to));

const SIGNATURES = [
  { type: "image/webp", matches: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP" },
  { type: "image/jpeg", matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: "image/png", matches: (b) => b[0] === 0x89 && ascii(b, 1, 4) === "PNG" },
];

export const detectImageType = (buffer) => {
  const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 16));
  return SIGNATURES.find((signature) => signature.matches(bytes))?.type ?? null;
};

export const assertAcceptableImage = (buffer, declaredType) => {
  const declared = String(declaredType ?? "").split(";")[0].trim().toLowerCase();
  if (!ACCEPTED_IMAGE_TYPES.includes(declared)) {
    fail(ERROR_CODES.unsupportedMedia, "Upload a WebP, JPEG or PNG photo.");
  }
  const detected = detectImageType(buffer);
  if (!detected) fail(ERROR_CODES.unsupportedMedia, "That file is not a valid photo.");
  return detected;
};

export const storeImage = (env, id, buffer, contentType, uploadedAt = Date.now()) =>
  env.CHASHMA_KV.put(KV_KEYS.image(id), buffer, { metadata: { contentType, uploadedAt } });

export const loadImage = (env, id) =>
  env.CHASHMA_KV.getWithMetadata(KV_KEYS.image(id), { type: "arrayBuffer" });

export const deleteImages = (env, ids) => Promise.all(ids.map((id) => env.CHASHMA_KV.delete(KV_KEYS.image(id))));

const imageIdOf = (key) => key.name.slice(KV_KEYS.imagePrefix.length);

const isOldEnough = (key, nowMs) => nowMs - (key.metadata?.uploadedAt ?? 0) >= LIMITS.orphanPhotoMinAgeMs;

export const findUnusedImageIds = async (env, referencedIds, nowMs = Date.now()) => {
  const keys = await listKeys(env, KV_KEYS.imagePrefix, LIMITS.imageListMax);
  return keys
    .filter((key) => isOldEnough(key, nowMs) && !referencedIds.has(imageIdOf(key)))
    .map(imageIdOf);
};
