const MAX_SIDE_PX = 1200;
const TARGET_BYTES = 300 * 1024;
const HARD_LIMIT_BYTES = 600 * 1024;
const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.5];
const SCALE_STEPS = [1, 0.8, 0.64];
const PREFERRED_TYPE = "image/webp";
const FALLBACK_TYPE = "image/jpeg";

export class ImageError extends Error {}

export const fitWithin = (width, height, maxSide) => {
  const longest = Math.max(width, height);
  if (longest <= maxSide) return { width, height };
  const ratio = maxSide / longest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
};

const decode = async (file) => {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      throw new ImageError("This photo could not be read. Try a JPG or PNG photo.");
    }
  }
};

const drawScaled = (bitmap, scale) => {
  const base = fitWithin(bitmap.width, bitmap.height, MAX_SIDE_PX);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(base.width * scale));
  canvas.height = Math.max(1, Math.round(base.height * scale));
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const encode = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

const encodeWithinTarget = async (canvas, type) => {
  let smallest = null;
  for (const quality of QUALITY_STEPS) {
    const blob = await encode(canvas, type, quality);
    if (!blob || blob.type !== type) return null;
    if (blob.size <= TARGET_BYTES) return blob;
    smallest = !smallest || blob.size < smallest.size ? blob : smallest;
  }
  return smallest;
};

const compressAtScales = async (bitmap, type) => {
  let best = null;
  for (const scale of SCALE_STEPS) {
    const blob = await encodeWithinTarget(drawScaled(bitmap, scale), type);
    if (!blob) return null;
    if (blob.size <= TARGET_BYTES) return blob;
    best = !best || blob.size < best.size ? blob : best;
  }
  return best;
};

export const compressImage = async (file) => {
  if (!file.type.startsWith("image/")) throw new ImageError("That file is not a photo.");
  const bitmap = await decode(file);
  try {
    const compressed = (await compressAtScales(bitmap, PREFERRED_TYPE)) ?? (await compressAtScales(bitmap, FALLBACK_TYPE));
    if (!compressed || compressed.size > HARD_LIMIT_BYTES) throw new ImageError("This photo is too large to use. Try a smaller one.");
    return compressed;
  } finally {
    bitmap.close?.();
  }
};
