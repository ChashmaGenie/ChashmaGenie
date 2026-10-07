const productUrl = (product) => `${window.location.origin}/p/${product.slug}`;

const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

const isUserCancel = (error) => error?.name === "AbortError";

export const shareProduct = async (product) => {
  const url = productUrl(product);
  if (canNativeShare()) {
    try {
      await navigator.share({ title: product.name, text: `${product.name} at ChashmaGenie`, url });
      return "shared";
    } catch (error) {
      return isUserCancel(error) ? "cancelled" : "failed";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
};
