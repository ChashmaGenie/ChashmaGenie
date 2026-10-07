import assert from "node:assert/strict";
import {
  ADD_VALUES, CYL_VALUES, SPH_VALUES, formatDiopter, formatPkPhone, normalizePkPhone, parseDiopter,
  recommendIndex, roundToQuarter, strongestMeridian, summarizeRx, transposeToMinus, validateContact,
  validateEye, validatePd, validateRx,
} from "../shared/rx.js";
import { validateQuoteInput } from "../shared/schema.js";

const cases = [];
const test = (name, run) => cases.push({ name, run });

test("parseDiopter accepts common spellings", () => {
  assert.equal(parseDiopter("-2"), -2);
  assert.equal(parseDiopter("+1.5"), 1.5);
  assert.equal(parseDiopter("1,25"), 1.25);
  assert.equal(parseDiopter("−0.75"), -0.75);
  ["plano", "PL", "ds", "0"].forEach((word) => assert.equal(parseDiopter(word), 0));
  assert.ok(Number.isNaN(parseDiopter("abc")));
  assert.ok(Number.isNaN(parseDiopter("")));
});

test("roundToQuarter and formatDiopter", () => {
  assert.equal(roundToQuarter(-2.37), -2.25);
  assert.equal(roundToQuarter(1.13), 1.25);
  assert.equal(Object.is(roundToQuarter(-0.05), 0), true);
  assert.equal(formatDiopter(1.25), "+1.25");
  assert.equal(formatDiopter(-2), "-2.00");
  assert.equal(formatDiopter(0), "0.00");
});

test("value lists start at zero and step by quarters", () => {
  assert.equal(SPH_VALUES[0], 0);
  assert.equal(SPH_VALUES.includes(-12), true);
  assert.equal(SPH_VALUES.includes(8), true);
  assert.equal(CYL_VALUES.includes(-6) && CYL_VALUES.includes(6), true);
  assert.equal(ADD_VALUES[0], 0.75);
  assert.equal(ADD_VALUES.at(-1), 4);
  assert.equal(SPH_VALUES.includes(-20) && SPH_VALUES.includes(12), true);
});

test("eye: -2.37 rounds to -2.25 with a warning", () => {
  const { errors, warnings, value } = validateEye({ sph: "-2.37" });
  assert.deepEqual(errors, {});
  assert.equal(value.sph, -2.25);
  assert.ok(warnings.some((warning) => warning.includes("-2.25")));
});

test("eye: +15 is a hard failure", () => {
  assert.ok(validateEye({ sph: "+15" }).errors.sph);
  assert.ok(validateEye({ sph: "-20.25" }).errors.sph);
  assert.deepEqual(validateEye({ sph: "-20" }).errors, {});
});

test("eye: sph is required but plano is fine", () => {
  assert.ok(validateEye({}).errors.sph);
  assert.deepEqual(validateEye({ sph: "plano" }).errors, {});
});

test("eye: cyl without axis fails, axis 0 becomes 180", () => {
  assert.ok(validateEye({ sph: "-1", cyl: "-0.75" }).errors.axis);
  assert.equal(validateEye({ sph: "-1", cyl: "-0.75", axis: "0" }).value.axis, 180);
  assert.ok(validateEye({ sph: "-1", cyl: "-0.75", axis: "181" }).errors.axis);
  assert.ok(validateEye({ sph: "-1", cyl: "-0.75", axis: "45.5" }).errors.axis);
});

test("eye: axis is dropped when cyl is zero", () => {
  const { errors, value } = validateEye({ sph: "-1", cyl: "0", axis: "90" });
  assert.deepEqual(errors, {});
  assert.equal(value.axis, null);
  assert.equal(value.cyl, 0);
});

test("eye: add is required only when needed", () => {
  assert.ok(validateEye({ sph: "1" }, { needsAdd: true }).errors.add);
  assert.ok(validateEye({ sph: "1", add: "0.5" }, { needsAdd: true }).errors.add);
  assert.equal(validateEye({ sph: "1", add: "2" }, { needsAdd: true }).value.add, 2);
  assert.equal(validateEye({ sph: "1", add: "2" }).value.add, 2);
  assert.equal(validateEye({ sph: "1" }).value.add, null);
});

test("eye: strong power warns without failing", () => {
  const { errors, warnings } = validateEye({ sph: "-11", cyl: "-4.5", axis: "10" });
  assert.deepEqual(errors, {});
  assert.equal(warnings.length, 2);
});

test("transposeToMinus converts plus cylinder", () => {
  assert.deepEqual(transposeToMinus({ sph: 0, cyl: 1.5, axis: 45 }), { sph: 1.5, cyl: -1.5, axis: 135 });
  assert.deepEqual(transposeToMinus({ sph: -1, cyl: 2, axis: 120 }), { sph: 1, cyl: -2, axis: 30 });
  assert.deepEqual(transposeToMinus({ sph: -1, cyl: -2, axis: 120 }), { sph: -1, cyl: -2, axis: 120 });
});

test("strongestMeridian", () => {
  assert.equal(strongestMeridian({ sph: -2, cyl: -1 }), 3);
  assert.equal(strongestMeridian({ sph: 2, cyl: -1 }), 2);
});

test("pd: single, dual and unknown", () => {
  assert.deepEqual(validatePd({ mode: "single", single: "63" }).errors, {});
  assert.ok(validatePd({ mode: "single", single: "39" }).errors.single);
  assert.ok(validatePd({ mode: "single", single: "81" }).errors.single);
  assert.equal(validatePd({ mode: "single", single: "48" }).warnings.length, 1);
  assert.equal(validatePd({ mode: "single", single: "74" }).warnings.length, 1);
  assert.equal(validatePd({ mode: "single", single: "48" }, { isKid: true }).warnings.length, 0);
  assert.deepEqual(validatePd({ mode: "dual", right: "31", left: "32" }).errors, {});
  assert.ok(validatePd({ mode: "dual", right: "45", left: "32" }).errors.right);
  assert.ok(validatePd({ mode: "dual", right: "19", left: "32" }).errors.right);
  assert.equal(validatePd({ mode: "dual", right: "29", left: "34" }).warnings.length, 1);
  assert.deepEqual(validatePd({ mode: "unknown" }).errors, {});
  assert.ok(validatePd({}).errors.mode);
});

const sampleRx = (overrides = {}) => ({
  mode: "enter",
  cylFormat: "minus",
  right: { sph: "-2.37", cyl: "-0.75", axis: "90" },
  left: { sph: "-2.00", cyl: "", axis: "" },
  pdMode: "dual",
  pd: { right: "31", left: "32" },
  ...overrides,
});

test("rx: full valid prescription is sanitised", () => {
  const { ok, value, warnings } = validateRx(sampleRx());
  assert.equal(ok, true);
  assert.deepEqual(value.right, { sph: -2.25, cyl: -0.75, axis: 90, add: null });
  assert.deepEqual(value.left, { sph: -2, cyl: 0, axis: null, add: null });
  assert.deepEqual(value.pd, { right: 31, left: 32 });
  assert.equal(value.cylFormat, "minus");
  assert.ok(warnings.some((warning) => warning.startsWith("Right eye:")));
});

test("rx: plus cylinder format is transposed on the server side too", () => {
  const { ok, value } = validateRx(sampleRx({ cylFormat: "plus", right: { sph: "0", cyl: "1.5", axis: "45" } }));
  assert.equal(ok, true);
  assert.deepEqual(value.right, { sph: 1.5, cyl: -1.5, axis: 135, add: null });
});

test("rx: positive cylinder without the plus flag is rejected", () => {
  const { ok, errors } = validateRx(sampleRx({ right: { sph: "0", cyl: "1.5", axis: "45" } }));
  assert.equal(ok, false);
  assert.ok(errors["right.cyl"]);
});

test("rx: errors are keyed by side and field", () => {
  const { ok, errors, value } = validateRx(sampleRx({ right: { sph: "+15" }, left: { cyl: "-1" }, pdMode: "single", pd: {} }));
  assert.equal(ok, false);
  assert.equal(value, null);
  ["right.sph", "left.sph", "left.axis", "pd.single"].forEach((key) => assert.ok(errors[key], key));
});

test("rx: needsAdd applies to both eyes", () => {
  const { errors } = validateRx(sampleRx(), { needsAdd: true });
  assert.ok(errors["right.add"] && errors["left.add"]);
});

test("rx: anisometropia warns", () => {
  const { ok, warnings } = validateRx(sampleRx({ right: { sph: "-6" }, left: { sph: "-1" } }));
  assert.equal(ok, true);
  assert.ok(warnings.some((warning) => warning.includes("differ by more than 4.00")));
});

test("rx: send later and absent prescriptions pass through", () => {
  assert.deepEqual(validateRx({ mode: "send_later", right: { sph: "junk" } }).value, { mode: "send_later" });
  assert.equal(validateRx(null).value, null);
  assert.equal(validateRx({ mode: "other" }).ok, false);
});

test("recommendIndex follows the bands", () => {
  const eyes = (sph) => ({ right: { sph, cyl: 0 }, left: { sph, cyl: 0 } });
  assert.equal(recommendIndex(eyes(-1.5), { rim: "full_rim" }).index, "1.50");
  assert.equal(recommendIndex(eyes(-1.5), { rim: "half_rim" }).index, "1.59");
  assert.equal(recommendIndex(eyes(-3), { rim: "full_rim" }).index, "1.59");
  assert.equal(recommendIndex(eyes(-5), { rim: "full_rim" }).index, "1.61");
  assert.equal(recommendIndex(eyes(-7), { rim: "full_rim" }).index, "1.67");
  assert.equal(recommendIndex(eyes(-9), { rim: "full_rim" }).index, "1.74");
  assert.equal(recommendIndex(eyes(4.5), { rim: "full_rim" }).index, "1.67");
  assert.equal(recommendIndex(eyes(-9), { rim: "rimless" }).index, "1.67");
  assert.match(recommendIndex(eyes(-9), { rim: "rimless" }).reason, /owner will confirm/);
  assert.equal(recommendIndex(null).index, null);
});

test("summarizeRx gives plain strings", () => {
  const { value } = validateRx(sampleRx());
  assert.deepEqual(summarizeRx(value), { right: "SPH -2.25 CYL -0.75 AXIS 90", left: "SPH -2.00", pd: "PD R 31 / L 32 mm" });
  assert.equal(summarizeRx({ mode: "send_later" }), null);
});

test("phone: accepted variants normalise to 92 format", () => {
  ["03001234567", "0300-1234567", "+923001234567", "923001234567", "0300 123 4567", "3001234567"].forEach((phone) =>
    assert.equal(normalizePkPhone(phone), "923001234567", phone),
  );
  ["04235761234", "0200123456", "12345", "", "+9230012345"].forEach((phone) => assert.equal(normalizePkPhone(phone), null, phone));
  assert.equal(formatPkPhone("+923001234567"), "0300-1234567");
});

const contact = (overrides = {}) => ({ name: "Ayesha Khan", phone: "0300 1234567", city: "Lahore", channel: "whatsapp", consent: true, ...overrides });

test("contact validation", () => {
  assert.equal(validateContact(contact()).ok, true);
  assert.equal(validateContact(contact({ name: "Zoë  Ali" })).value.name, "Zoë Ali");
  assert.equal(validateContact(contact({ name: "علی احمد" })).ok, true);
  assert.ok(validateContact(contact({ name: "A1" })).errors.name);
  assert.ok(validateContact(contact({ phone: "0421" })).errors.phone);
  assert.ok(validateContact(contact({ city: "L" })).errors.city);
  assert.ok(validateContact(contact({ email: "nope" })).errors.email);
  assert.ok(validateContact(contact({ channel: "email" })).errors.email);
  assert.ok(validateContact(contact({ notes: "x".repeat(501) })).errors.notes);
  assert.ok(validateContact(contact({ consent: false })).errors.consent);
});

const quotePayload = (overrides = {}) => ({
  items: [{ slug: "moonlit-round", colorKey: "gold", sizeIndex: 0, ownFrame: false, note: "" }],
  usage: "everyday",
  lensPackageId: null,
  extras: [],
  tintColor: null,
  rx: { mode: "send_later" },
  contact: { name: "Ayesha Khan", phone: "03001234567", city: "Lahore", channel: "whatsapp", email: "", notes: "" },
  consent: true,
  attribution: { source: "instagram", medium: "bio" },
  website: "",
  ...overrides,
});

test("schema accepts every quote path the wizard can produce", () => {
  const enteredRx = sampleRx();
  const paths = {
    enterRx: quotePayload({ rx: enteredRx }),
    sendLater: quotePayload(),
    noRx: quotePayload({ rx: null }),
    ownFrame: quotePayload({ items: [{ slug: "", colorKey: "", sizeIndex: null, ownFrame: true, note: "Black rectangle" }] }),
    noFrame: quotePayload({ items: [{ slug: "", colorKey: "", sizeIndex: null, ownFrame: false, note: "Something light" }] }),
  };
  Object.entries(paths).forEach(([name, payload]) => {
    const check = validateQuoteInput(payload);
    assert.equal(check.ok, true, `${name}: ${JSON.stringify(check.errors)}`);
  });
});

test("schema rejects a bad phone and a missing consent", () => {
  const { ok, errors } = validateQuoteInput(quotePayload({ consent: false, contact: { ...quotePayload().contact, phone: "12" } }));
  assert.equal(ok, false);
  assert.ok(errors["contact.phone"] && errors.consent);
});

test("phone: accepts common Pakistani formats and rejects junk", () => {
  ["0300 1234567", "+92 300 1234567", "923001234567", "3001234567", "0092 300 1234567", "0092-300-1234567", "+92 0300 1234567", "+9203001234567"]
    .forEach((format) => assert.equal(normalizePkPhone(format), "923001234567", format));
  ["", "12345", "0200 1234567", "03001234567x", null, ["03001234567"]].forEach((junk) => assert.equal(normalizePkPhone(junk), null));
});

test("numeric strictness: hex, exponent and arrays are rejected", () => {
  const eye = (extra) => validateEye({ sph: "-1", cyl: "-1", axis: "10", ...extra });
  assert.ok(eye({ axis: "0x10" }).errors.axis);
  assert.ok(eye({ axis: "1e1" }).errors.axis);
  assert.ok(eye({ sph: [1] }).errors.sph);
  assert.ok(validatePd({ mode: "single", single: "0x3F" }).errors.single);
});

test("contact: punctuation-only names and query-string emails are rejected", () => {
  const contact = (extra) => validateContact({ name: "Ali Khan", phone: "03001234567", city: "Lahore", consent: true, ...extra });
  assert.equal(contact({ name: ".." }).ok, false);
  assert.equal(contact({ email: "a@b.cc?subject=x&body=phish" }).ok, false);
  assert.equal(contact({ email: "ali@example.com" }).ok, true);
});

test("rx: ADD survives quote validation and is required by the lens builder", () => {
  const rx = { mode: "enter", cylFormat: "minus", right: { sph: "-1", cyl: "0", add: "2" }, left: { sph: "-1", cyl: "0", add: "2" }, pdMode: "unknown" };
  const first = validateRx(rx);
  assert.equal(first.value.right.add, 2);
  assert.equal(validateRx(first.value, { needsAdd: true }).ok, true);
  assert.ok(validateRx({ ...rx, right: { sph: "-1", cyl: "0" } }, { needsAdd: true }).errors["right.add"]);
});

const failures = cases.flatMap(({ name, run }) => {
  try {
    run();
    return [];
  } catch (error) {
    return [{ name, error }];
  }
});

console.log(`${cases.length - failures.length}/${cases.length} rx tests passed`);
failures.forEach(({ name, error }) => console.error(`FAIL ${name}\n  ${error.message}`));
process.exit(failures.length === 0 ? 0 : 1);
