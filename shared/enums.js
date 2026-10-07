const options = (pairs) => pairs.map(([value, label]) => ({ value, label }));

export const CATEGORIES = options([
  ["eyeglasses", "Eyeglasses"],
  ["sunglasses", "Sunglasses"],
  ["computer", "Computer / Blue-light"],
  ["kids", "Kids"],
  ["lenses", "Lenses"],
]);

export const GENDERS = options([
  ["men", "Men"],
  ["women", "Women"],
  ["unisex", "Unisex"],
  ["kids", "Kids"],
]);

export const SHAPES = options([
  ["round", "Round"],
  ["square", "Square"],
  ["rectangle", "Rectangle"],
  ["oval", "Oval"],
  ["cat_eye", "Cat-eye"],
  ["aviator", "Aviator"],
  ["geometric", "Geometric"],
  ["browline", "Browline"],
  ["wayfarer", "Wayfarer"],
]);

export const RIM_TYPES = options([
  ["full_rim", "Full rim"],
  ["half_rim", "Half rim"],
  ["rimless", "Rimless"],
]);

export const MATERIALS = options([
  ["acetate", "Acetate"],
  ["metal", "Metal"],
  ["tr90", "TR90"],
  ["titanium", "Titanium"],
  ["mixed", "Mixed"],
  ["nylon", "Nylon"],
]);

export const SIZE_LABELS = [
  { value: "extra_narrow", label: "Extra narrow", hint: "46 mm or less" },
  { value: "narrow", label: "Narrow", hint: "47-50 mm" },
  { value: "medium", label: "Medium", hint: "51-53 mm" },
  { value: "wide", label: "Wide", hint: "54-56 mm" },
  { value: "extra_wide", label: "Extra wide", hint: "57 mm or more" },
];

export const COLORS = [
  { value: "black", label: "Black", hex: "#111111" },
  { value: "tortoise", label: "Tortoise", hex: "#8B5A2B" },
  { value: "clear", label: "Clear", hex: "#E8EEF0", bordered: true },
  { value: "gold", label: "Gold", hex: "#D4A017" },
  { value: "silver", label: "Silver", hex: "#B8C0C8" },
  { value: "blue", label: "Blue", hex: "#2B5CA8" },
  { value: "green", label: "Green", hex: "#2E7D5B" },
  { value: "red_pink", label: "Red / Pink", hex: "#D9546B" },
  { value: "brown", label: "Brown", hex: "#6B4423" },
  { value: "grey", label: "Grey", hex: "#7A838C" },
  {
    value: "multi",
    label: "Multicolour",
    hex: "#D4A017",
    gradient: "conic-gradient(#D9546B, #F2B705, #2E7D5B, #2B5CA8, #D9546B)",
  },
];

export const FACE_SHAPES = options([
  ["round", "Round"],
  ["oval", "Oval"],
  ["square", "Square"],
  ["heart", "Heart"],
  ["diamond", "Diamond"],
  ["oblong", "Oblong"],
  ["triangle", "Triangle"],
]);

export const FACE_SHAPE_FITS = {
  round: ["rectangle", "square", "geometric", "wayfarer", "cat_eye"],
  oval: ["aviator", "round", "rectangle", "wayfarer", "square", "oval"],
  square: ["round", "oval", "cat_eye", "aviator"],
  heart: ["round", "oval", "aviator"],
  diamond: ["cat_eye", "oval", "browline"],
  oblong: ["square", "wayfarer", "geometric"],
  triangle: ["browline", "cat_eye", "aviator"],
};

export const FEATURES = options([
  ["spring_hinge", "Spring hinges"],
  ["adjustable_nose_pads", "Adjustable nose pads"],
  ["lightweight", "Lightweight"],
  ["hypoallergenic", "Hypoallergenic"],
  ["polarized", "Polarized"],
  ["uv400", "UV400"],
  ["blue_light", "Blue-light filter"],
  ["low_bridge_fit", "Low bridge fit"],
  ["flexible", "Flexible"],
]);

export const BADGES = options([
  ["new", "New"],
  ["bestseller", "Bestseller"],
]);

export const STOCK_STATUS = options([
  ["in_stock", "In stock"],
  ["made_to_order", "Made to order"],
  ["out_of_stock", "Out of stock"],
]);

export const LENS_TYPES = options([
  ["single_vision", "Single vision"],
  ["progressive", "Progressive"],
  ["bifocal", "Bifocal"],
  ["non_prescription", "Non-prescription"],
]);

export const LENS_INDEXES = options([
  ["1.50", "Standard 1.50"],
  ["1.59", "Thin 1.59 polycarbonate"],
  ["1.61", "Thinner 1.61"],
  ["1.67", "Ultra-thin 1.67"],
  ["1.74", "Thinnest 1.74"],
]);

export const COATINGS = [
  { value: "anti_scratch", label: "Anti-scratch", included: true },
  { value: "uv400", label: "UV400", included: true },
  { value: "anti_reflective", label: "Anti-reflective", included: false },
  { value: "blue_light_filter", label: "Blue-light filter", included: false },
  { value: "water_oil_repellent", label: "Water and oil repellent", included: false },
  { value: "anti_fog", label: "Anti-fog", included: false },
];

export const LENS_TREATMENTS = options([
  ["clear", "Clear"],
  ["blue_light", "Blue-light filter"],
  ["photochromic", "Photochromic"],
  ["tint_solid", "Solid tint"],
  ["tint_gradient", "Gradient tint"],
  ["polarized", "Polarized"],
]);

export const TINT_COLORS = options([
  ["grey", "Grey"],
  ["brown", "Brown"],
  ["green", "Green"],
  ["blue", "Blue"],
  ["pink", "Pink"],
  ["yellow", "Yellow"],
]);

export const USAGE = [
  { value: "everyday", label: "Everyday", blurb: "Walking around, work, general use." },
  { value: "computer", label: "Computer / screens", blurb: "Long hours on laptop or phone." },
  { value: "reading", label: "Reading", blurb: "Books, close-up work and hobbies." },
  { value: "driving", label: "Driving", blurb: "Clear, glare-free vision on the road." },
  { value: "sunglasses_only", label: "Sunglasses with power", blurb: "Prescription lenses with a sun tint." },
  { value: "kids_school", label: "Kids / school", blurb: "Tough, comfortable lenses for children." },
];

export const RX_MODE = options([
  ["enter", "Enter my prescription"],
  ["send_later", "I will send it later"],
]);

export const PD_MODE = options([
  ["single", "One number"],
  ["dual", "Two numbers (right and left)"],
  ["unknown", "I do not know my PD"],
]);

export const CONTACT_CHANNELS = options([
  ["whatsapp", "WhatsApp"],
  ["call", "Phone call"],
  ["email", "Email"],
  ["instagram", "Instagram"],
]);

export const QUOTE_STATUS = options([
  ["new", "New"],
  ["contacted", "Contacted"],
  ["quoted", "Quoted"],
  ["won", "Won"],
  ["lost", "Lost"],
]);

export const EYES = options([
  ["right", "Right eye (OD)"],
  ["left", "Left eye (OS)"],
]);

export const valuesOf = (list) => list.map((entry) => entry.value);

export const isOneOf = (list, value) => valuesOf(list).includes(value);

export const labelOf = (list, value) => {
  const entry = list.find((candidate) => candidate.value === value);
  return entry ? entry.label : "";
};

export const deriveSizeLabel = (lensWidthMm) => {
  const width = Number(lensWidthMm);
  if (!Number.isFinite(width) || width <= 0) return null;
  if (width <= 46) return "extra_narrow";
  if (width <= 50) return "narrow";
  if (width <= 53) return "medium";
  if (width <= 56) return "wide";
  return "extra_wide";
};
