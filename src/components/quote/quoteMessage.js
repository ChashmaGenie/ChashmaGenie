const GREETING = "Assalam o Alaikum! I'd like a quote.";
const MAX_ENCODED_LENGTH = 1500;
const NOTES_SHRINK_RATIO = 0.8;
const MIN_NOTES_LENGTH = 40;

const encodedLength = (text) => encodeURIComponent(text).length;

const joinLines = (lines) => lines.filter(Boolean).join("\n");

const coreLines = (summary) => [
  GREETING,
  summary.ref ? `Ref: ${summary.ref}` : null,
  ...summary.frameLines,
  `Usage: ${summary.usage}`,
  `Lens: ${summary.lens}`,
  summary.prescription ? `Prescription: ${summary.prescription}` : null,
  `Name: ${summary.name}`,
  `City: ${summary.city}`,
  summary.source ? `Source: ${summary.source}` : null,
];

const shrunkNotes = (notes) => {
  const characters = Array.from(notes);
  if (characters.length <= MIN_NOTES_LENGTH) return "";
  return characters.slice(0, Math.floor(characters.length * NOTES_SHRINK_RATIO)).join("").trimEnd();
};

const withFittingNotes = (core, notes, maxLength) => {
  if (!notes) return joinLines(core);
  const candidate = joinLines([...core, `Notes: ${notes}`]);
  return encodedLength(candidate) <= maxLength ? candidate : withFittingNotes(core, shrunkNotes(notes), maxLength);
};

export const buildQuoteMessage = (summary, maxLength = MAX_ENCODED_LENGTH) =>
  withFittingNotes(coreLines(summary), summary.notes, maxLength);

const emailBody = (summary) =>
  joinLines([buildQuoteMessage(summary), `Phone: ${summary.phone}`, summary.email ? `Email: ${summary.email}` : null]);

export const buildMailto = (summary, address) => {
  const subject = summary.ref ? `Quote request ${summary.ref}` : "Quote request";
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody(summary))}`;
};
