import { ROUTES } from "./contract.js";
import { escapeXml } from "./xml.js";

const DEFAULT_IMAGE_PATH = "/og-default.png";
const DESCRIPTION_LIMIT = 160;

const AVAILABILITY = {
  in_stock: "https://schema.org/InStock",
  made_to_order: "https://schema.org/PreOrder",
  out_of_stock: "https://schema.org/OutOfStock",
};

const formatRs = (amount) => `Rs ${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const truncate = (text, limit) => (text.length <= limit ? text : `${text.slice(0, limit - 1).trimEnd()}…`);

const isRasterImage = (ref) => !ref.toLowerCase().endsWith(".svg");

export const absoluteImageUrl = (origin, product) => {
  const [first] = product.images;
  if (!first || !isRasterImage(first)) return origin + DEFAULT_IMAGE_PATH;
  return origin + (first.startsWith("/") ? first : ROUTES.image(first));
};

const describe = (product) =>
  truncate(product.description || `${product.name} from ChashmaGenie. ${formatRs(product.price)}. Get a quote online.`, DESCRIPTION_LIMIT);

export const productFacts = (origin, product) => ({
  title: `${product.name} | ChashmaGenie`,
  description: describe(product),
  url: `${origin}/p/${product.slug}`,
  image: absoluteImageUrl(origin, product),
});

const escapeJsonForHtml = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

export const productJsonLd = (product, facts) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  image: [facts.image],
  description: facts.description,
  ...(product.sku ? { sku: product.sku } : {}),
  brand: { "@type": "Brand", name: product.brand || "ChashmaGenie" },
  offers: {
    "@type": "Offer",
    price: String(product.price),
    priceCurrency: "PKR",
    availability: AVAILABILITY[product.stock] ?? AVAILABILITY.in_stock,
    url: facts.url,
  },
});

const metaTag = (attribute, name, content) => `<meta ${attribute}="${name}" content="${escapeXml(content)}">`;

const extraHeadHtml = (product, facts) =>
  [
    metaTag("property", "product:price:amount", String(product.price)),
    metaTag("property", "product:price:currency", "PKR"),
    metaTag("name", "twitter:title", facts.title),
    metaTag("name", "twitter:description", facts.description),
    metaTag("name", "twitter:image", facts.image),
    `<script type="application/ld+json">${escapeJsonForHtml(productJsonLd(product, facts))}</script>`,
  ].join("");

class SetContent {
  constructor(content) {
    this.content = content;
  }

  element(element) {
    element.setAttribute("content", this.content);
  }
}

class SetHref {
  constructor(href) {
    this.href = href;
  }

  element(element) {
    element.setAttribute("href", this.href);
  }
}

class SetTitle {
  constructor(title) {
    this.title = title;
  }

  element(element) {
    element.setInnerContent(this.title);
  }
}

class AppendToHead {
  constructor(html) {
    this.html = html;
  }

  element(element) {
    element.append(this.html, { html: true });
  }
}

export const rewriteProductPage = (shellResponse, origin, product) => {
  const facts = productFacts(origin, product);
  return new HTMLRewriter()
    .on("title", new SetTitle(facts.title))
    .on('meta[name="description"]', new SetContent(facts.description))
    .on('meta[property="og:title"]', new SetContent(facts.title))
    .on('meta[property="og:description"]', new SetContent(facts.description))
    .on('meta[property="og:image"]', new SetContent(facts.image))
    .on('meta[property="og:url"]', new SetContent(facts.url))
    .on('meta[property="og:type"]', new SetContent("product"))
    .on('link[rel="canonical"]', new SetHref(facts.url))
    .on("head", new AppendToHead(extraHeadHtml(product, facts)))
    .transform(shellResponse);
};
