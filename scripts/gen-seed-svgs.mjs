import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SEED_CATALOG } from "../shared/seed-catalog.js";
import { COLORS } from "../shared/enums.js";

const OUTPUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "seed-img");
const BACKGROUND = "#F3EAD3";
const LENS_Y = 300;
const LEFT_X = 250;
const RIGHT_X = 550;

const hexOf = (colorKey) => COLORS.find((color) => color.value === colorKey)?.hex ?? "#111111";

const escapeXml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const lensOutline = {
  round: (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="92"/>`,
  square: (cx, cy) => `<rect x="${cx - 94}" y="${cy - 90}" width="188" height="180" rx="26"/>`,
  rectangle: (cx, cy) => `<rect x="${cx - 100}" y="${cy - 68}" width="200" height="136" rx="18"/>`,
  oval: (cx, cy) => `<ellipse cx="${cx}" cy="${cy}" rx="100" ry="74"/>`,
  cat_eye: (cx, cy, side) => {
    const lift = side === "left" ? -1 : 1;
    const outerX = cx + lift * 104;
    const innerX = cx - lift * 98;
    return `<path d="M${innerX} ${cy - 50} Q${cx} ${cy - 72} ${outerX} ${cy - 84} Q${outerX + lift * 8} ${cy + 10} ${cx + lift * 40} ${cy + 66} Q${cx - lift * 40} ${cy + 80} ${innerX} ${cy + 40} Z"/>`;
  },
  aviator: (cx, cy) => `<path d="M${cx - 104} ${cy - 66} Q${cx} ${cy - 90} ${cx + 104} ${cy - 66} Q${cx + 100} ${cy + 70} ${cx + 10} ${cy + 96} Q${cx - 84} ${cy + 76} ${cx - 104} ${cy - 66} Z"/>`,
  geometric: (cx, cy) => `<polygon points="${cx - 60},${cy - 88} ${cx + 60},${cy - 88} ${cx + 100},${cy} ${cx + 60},${cy + 88} ${cx - 60},${cy + 88} ${cx - 100},${cy}"/>`,
  browline: (cx, cy) => `<path d="M${cx - 102} ${cy - 56} L${cx + 102} ${cy - 56} L${cx + 92} ${cy + 40} Q${cx} ${cy + 96} ${cx - 92} ${cy + 40} Z"/>`,
  wayfarer: (cx, cy) => `<path d="M${cx - 106} ${cy - 74} L${cx + 106} ${cy - 60} L${cx + 84} ${cy + 66} Q${cx} ${cy + 88} ${cx - 84} ${cy + 66} Z"/>`,
};

const document = (title, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img"><title>${escapeXml(title)}</title><rect width="800" height="600" fill="${BACKGROUND}"/>${body}</svg>\n`;

const strokeFor = (shape, strokeWidth) =>
  shape === "browline" ? strokeWidth + 4 : strokeWidth;

const frontView = (product) => {
  const stroke = hexOf(product.colors[0]);
  const isRimless = product.rim === "rimless";
  const draw = lensOutline[product.shape] ?? lensOutline.round;
  const strokeWidth = isRimless ? 2 : strokeFor(product.shape, product.material === "acetate" ? 14 : 7);
  const lensFill = product.category === "sunglasses" ? "rgba(30,40,50,0.55)" : "rgba(120,190,220,0.28)";
  const lenses = ["left", "right"]
    .map((side) => `<g fill="${lensFill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round">${draw(side === "left" ? LEFT_X : RIGHT_X, LENS_Y, side)}</g>`)
    .join("");
  const bridge = `<path d="M${LEFT_X + 96} ${LENS_Y - 30} Q400 ${LENS_Y - 62} ${RIGHT_X - 96} ${LENS_Y - 30}" fill="none" stroke="${stroke}" stroke-width="${Math.max(strokeWidth - 2, 4)}" stroke-linecap="round"/>`;
  const arms = `<path d="M${LEFT_X - 100} ${LENS_Y - 50} L${LEFT_X - 140} ${LENS_Y - 62} M${RIGHT_X + 100} ${LENS_Y - 50} L${RIGHT_X + 140} ${LENS_Y - 62}" stroke="${stroke}" stroke-width="${Math.max(strokeWidth - 3, 4)}" stroke-linecap="round"/>`;
  return document(`${product.name} front view`, `${lenses}${bridge}${arms}`);
};

const angleView = (product) => {
  const stroke = hexOf(product.colors[0] ?? "black");
  const draw = lensOutline[product.shape] ?? lensOutline.round;
  const lensFill = product.category === "sunglasses" ? "rgba(30,40,50,0.55)" : "rgba(120,190,220,0.28)";
  const strokeWidth = product.material === "acetate" ? 14 : 7;
  const body = `<g transform="translate(130 20) scale(0.9)"><g fill="${lensFill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round">${draw(260, 300, "left")}</g><path d="M360 252 L690 238 Q730 236 730 270 L730 330" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  return document(`${product.name} side view`, body);
};

const lensView = (product, view) => {
  const { index, treatment } = product.lens;
  const tint = treatment === "blue_light" ? "rgba(120,170,230,0.45)" : "rgba(160,200,225,0.35)";
  const thickness = view === 1 ? 26 : 12;
  const body = `<ellipse cx="400" cy="300" rx="190" ry="${150 - thickness}" fill="${tint}" stroke="#4B5B6B" stroke-width="6"/><ellipse cx="400" cy="300" rx="150" ry="${110 - thickness}" fill="none" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="4"/><text x="400" y="500" font-family="Georgia, serif" font-size="44" text-anchor="middle" fill="#0F2A3F">${escapeXml(index)}</text>`;
  return document(`${product.name} lens`, body);
};

const imagesToGenerate = (product) =>
  product.images
    .map((path, position) => ({ path, position }))
    .filter(({ path }) => path.endsWith(".svg"));

const renderFor = (product, position) => {
  if (product.category === "lenses") return lensView(product, position);
  return position === 0 ? frontView(product) : angleView(product);
};

const writeSvg = (path, content) => writeFileSync(join(OUTPUT_DIR, path.replace("/seed-img/", "")), content);

mkdirSync(OUTPUT_DIR, { recursive: true });
SEED_CATALOG.products.forEach((product) =>
  imagesToGenerate(product).forEach(({ path, position }) => writeSvg(path, renderFor(product, position))),
);
