import { makeId } from "../../shared/schema.js";

const QUOTE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const QUOTE_CODE_LENGTH = 6;

const randomBytes = (count) => globalThis.crypto.getRandomValues(new Uint8Array(count));

export const makeQuoteId = () =>
  `CG-${Array.from(randomBytes(QUOTE_CODE_LENGTH), (byte) => QUOTE_ALPHABET[byte % QUOTE_ALPHABET.length]).join("")}`;

export const makeImageId = () => makeId("img", 10);

export const makeProductId = () => makeId("p", 8);
