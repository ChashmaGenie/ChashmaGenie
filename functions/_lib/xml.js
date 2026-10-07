const STATIC_PATHS = ["/", "/shop", "/shop/eyeglasses", "/shop/sunglasses", "/shop/computer", "/shop/kids", "/shop/lenses",
  "/links", "/about", "/contact", "/faq", "/shipping-returns", "/privacy"];

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

export const escapeXml = (text) => String(text).replace(/[&<>"']/g, (char) => ESCAPES[char]);

const urlEntry = (origin, path, lastModified) =>
  `  <url><loc>${escapeXml(origin + path)}</loc>${lastModified ? `<lastmod>${escapeXml(lastModified.slice(0, 10))}</lastmod>` : ""}</url>`;

export const buildSitemap = (origin, products) => {
  const staticEntries = STATIC_PATHS.map((path) => urlEntry(origin, path));
  const productEntries = products
    .filter((product) => product.visible !== false && product.category !== "lenses")
    .map((product) => urlEntry(origin, `/p/${product.slug}`, product.updatedAt));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...productEntries,
    "</urlset>",
    "",
  ].join("\n");
};

export const buildRobots = (origin) =>
  ["User-agent: *", "Allow: /", "Allow: /api/img/", "Disallow: /admin", "Disallow: /api/", `Sitemap: ${origin}/sitemap.xml`, ""].join("\n");
