export const imageUrl = (ref) => {
  if (!ref) return "";
  return ref.startsWith("/") ? ref : `/api/img/${ref}`;
};

export const firstImageUrl = (product) => imageUrl(product?.images?.[0]);

export const absoluteUrl = (path, origin = window.location.origin) => `${origin}${path}`;
