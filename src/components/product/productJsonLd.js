import { imageUrl } from "@/lib/images.js";

const AVAILABILITY = {
  in_stock: "https://schema.org/InStock",
  made_to_order: "https://schema.org/MadeToOrder",
  out_of_stock: "https://schema.org/OutOfStock",
};

const absolute = (path, origin) => (path.startsWith("http") ? path : `${origin}${path}`);

export const buildProductJsonLd = (product, origin) => {
  const url = `${origin}/p/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((ref) => absolute(imageUrl(ref), origin)),
    description: product.description || product.name,
    ...(product.sku ? { sku: product.sku } : { sku: product.id }),
    brand: { "@type": "Brand", name: product.brand || "ChashmaGenie" },
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "PKR",
      availability: AVAILABILITY[product.stock] ?? AVAILABILITY.in_stock,
    },
  };
};
