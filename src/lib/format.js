const withThousands = (digits) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatPkr = (amount) => {
  const rounded = Math.round(Number(amount) || 0);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}Rs ${withThousands(String(Math.abs(rounded)))}`;
};

export const discountPercent = (price, compareAtPrice) => {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

export const formatDate = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
