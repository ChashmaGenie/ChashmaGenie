const encoder = new TextEncoder();

export const toBase64Url = (bytes) => {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const fromBase64Url = (text) => {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

export const sha256 = (text) => globalThis.crypto.subtle.digest("SHA-256", encoder.encode(text));

export const sha256Hex = async (text) =>
  Array.from(new Uint8Array(await sha256(text)), (byte) => byte.toString(16).padStart(2, "0")).join("");

export const timingSafeEqual = (left, right) => {
  const a = new Uint8Array(left);
  const b = new Uint8Array(right);
  if (a.length !== b.length) return false;
  return a.reduce((difference, byte, index) => difference | (byte ^ b[index]), 0) === 0;
};

export const passwordMatches = async (candidate, expected) =>
  timingSafeEqual(await sha256(candidate), await sha256(expected));

const hmacKey = (secret, usages) =>
  globalThis.crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usages);

export const signHmac = async (secret, message) =>
  toBase64Url(await globalThis.crypto.subtle.sign("HMAC", await hmacKey(secret, ["sign"]), encoder.encode(message)));

export const verifyHmac = async (secret, message, signature) => {
  try {
    return await globalThis.crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret, ["verify"]),
      fromBase64Url(signature),
      encoder.encode(message),
    );
  } catch {
    return false;
  }
};
