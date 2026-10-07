import { CATEGORIES, SHAPES } from "@shared/enums.js";

export const PRIMARY_NAV = CATEGORIES.map(({ value, label }) => ({ label, to: `/shop/${value}` }));

export const SHOP_BY_USE = [
  { label: "Computer", to: "/shop/computer" },
  { label: "Reading", to: "/shop/eyeglasses" },
  { label: "Driving", to: "/shop?feat=polarized" },
  { label: "Kids", to: "/shop/kids" },
];

export const SHOP_BY_SHAPE = SHAPES.map(({ value, label }) => ({ label, to: `/shop?shape=${value}` }));

export const MORE_LINKS = [
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];
