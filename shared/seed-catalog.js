import { deriveSizeLabel } from "./enums.js";

const SEED_UPDATED_AT = "2026-01-01T00:00:00.000Z";
const FIRST_CREATED_AT = Date.UTC(2025, 10, 1);
const DAY_MS = 86400000;

const createdAtFor = (position) => new Date(FIRST_CREATED_AT + position * 3 * DAY_MS).toISOString();

const slugOf = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const defaultImages = (slug) => [`/seed-img/${slug}-1.svg`, `/seed-img/${slug}-2.svg`];

const buildFrame = (position, spec) => {
  const slug = slugOf(spec.name);
  const [lens, bridge, temple] = spec.size;
  return {
    id: `p_seed${String(position + 1).padStart(4, "0")}`,
    slug,
    name: spec.name,
    brand: "ChashmaGenie",
    category: spec.category,
    gender: spec.gender,
    shape: spec.shape,
    rim: spec.rim,
    material: spec.material,
    colors: spec.colors,
    sizes: [{ lens, bridge, temple }],
    sizeLabel: deriveSizeLabel(lens),
    faceShapes: spec.faceShapes,
    price: spec.price,
    ...(spec.compareAtPrice ? { compareAtPrice: spec.compareAtPrice } : {}),
    rxCompatible: spec.rxCompatible,
    multifocalOk: spec.multifocalOk ?? false,
    badges: spec.badges ?? [],
    stock: "in_stock",
    featured: spec.featured ?? false,
    visible: true,
    sample: true,
    images: spec.images ?? defaultImages(slug),
    description: spec.description,
    features: spec.features,
    createdAt: createdAtFor(position),
    updatedAt: SEED_UPDATED_AT,
  };
};

const buildLens = (position, spec) => {
  const slug = slugOf(spec.name);
  return {
    id: `p_seed${String(position + 1).padStart(4, "0")}`,
    slug,
    name: spec.name,
    brand: "ChashmaGenie",
    category: "lenses",
    gender: "unisex",
    shape: null,
    rim: null,
    material: null,
    colors: [],
    sizes: [],
    sizeLabel: null,
    faceShapes: [],
    price: spec.price,
    rxCompatible: true,
    multifocalOk: spec.lens.lensType === "progressive",
    badges: [],
    stock: "made_to_order",
    featured: false,
    visible: true,
    sample: true,
    images: defaultImages(slug),
    description: spec.description,
    features: spec.features,
    lens: spec.lens,
    createdAt: createdAtFor(position),
    updatedAt: SEED_UPDATED_AT,
  };
};

const FRAME_SPECS = [
  {
    name: "Genie Aviator Gold", category: "sunglasses", gender: "unisex", shape: "aviator", rim: "full_rim",
    material: "metal", colors: ["gold", "silver"], size: [58, 14, 140], price: 6500,
    features: ["polarized", "uv400", "adjustable_nose_pads"], badges: ["bestseller"], featured: true,
    rxCompatible: false, faceShapes: ["oval", "square", "heart", "triangle"],
    images: ["/seed-img/pd-01.webp", "/seed-img/genie-aviator-gold-2.svg"],
    description: "A classic teardrop aviator with a slim gold frame, polarized UV400 lenses and soft adjustable nose pads for all-day comfort.",
  },
  {
    name: "Square Acetate Noir", category: "eyeglasses", gender: "men", shape: "square", rim: "full_rim",
    material: "acetate", colors: ["black", "tortoise"], size: [53, 18, 145], price: 5200,
    features: ["spring_hinge"], badges: ["bestseller"], featured: true,
    rxCompatible: true, multifocalOk: true, faceShapes: ["round", "oval", "oblong"],
    images: ["/seed-img/pd-02.webp", "/seed-img/square-acetate-noir-2.svg"],
    description: "A confident square acetate frame with spring hinges that flex with you. Takes single vision and progressive lenses.",
  },
  {
    name: "Moonlit Round", category: "eyeglasses", gender: "unisex", shape: "round", rim: "full_rim",
    material: "metal", colors: ["gold", "silver"], size: [49, 21, 140], price: 4200,
    features: ["adjustable_nose_pads", "lightweight"], badges: ["new"], featured: true,
    rxCompatible: true, faceShapes: ["oval", "square", "heart"],
    description: "A thin round metal frame with a gentle retro feel. Light on the nose and easy to dress up or down.",
  },
  {
    name: "Willow Cat-Eye", category: "eyeglasses", gender: "women", shape: "cat_eye", rim: "full_rim",
    material: "acetate", colors: ["tortoise", "red_pink"], size: [52, 17, 140], price: 4800,
    features: ["spring_hinge"], badges: ["new"], featured: true,
    rxCompatible: true, faceShapes: ["round", "square", "diamond", "triangle"],
    description: "Softly lifted corners and a warm tortoise finish give this cat-eye frame an elegant look.",
  },
  {
    name: "Studio Browline", category: "eyeglasses", gender: "men", shape: "browline", rim: "half_rim",
    material: "mixed", colors: ["black", "gold"], size: [51, 20, 145], price: 5900,
    features: [], rxCompatible: true, multifocalOk: true, faceShapes: ["diamond", "triangle"],
    description: "A bold acetate brow bar paired with a light metal lower rim. Smart, structured and easy to wear.",
  },
  {
    name: "Featherlight Rimless", category: "eyeglasses", gender: "unisex", shape: "oval", rim: "rimless",
    material: "titanium", colors: ["silver"], size: [50, 19, 138], price: 9800,
    features: ["lightweight", "hypoallergenic", "adjustable_nose_pads"], rxCompatible: true, multifocalOk: true,
    faceShapes: ["oval", "diamond"],
    description: "Almost nothing there. A titanium rimless frame that is gentle on sensitive skin and barely noticeable.",
  },
  {
    name: "Screen Guard Clear", category: "computer", gender: "unisex", shape: "rectangle", rim: "full_rim",
    material: "tr90", colors: ["clear", "black"], size: [54, 17, 142], price: 3200,
    features: ["blue_light", "lightweight", "flexible"], badges: ["bestseller"], featured: true,
    rxCompatible: true, faceShapes: ["round", "oval"],
    description: "A flexible, lightweight TR90 frame made for long days on screens. Blue-light lenses are available in plain or prescription.",
  },
  {
    name: "Pixel Geo", category: "computer", gender: "women", shape: "geometric", rim: "full_rim",
    material: "acetate", colors: ["multi", "green"], size: [51, 18, 140], price: 3600,
    features: ["blue_light"], rxCompatible: true, faceShapes: ["round", "oblong"],
    description: "A playful geometric frame with a screen-friendly blue-light filter. Looks great on video calls.",
  },
  {
    name: "Little Explorer", category: "kids", gender: "kids", shape: "round", rim: "full_rim",
    material: "tr90", colors: ["blue", "green"], size: [44, 16, 125], price: 2400,
    features: ["flexible", "lightweight", "spring_hinge"], rxCompatible: true, faceShapes: ["round", "oval"],
    description: "A bendy, tough round frame built for school, play and everything in between.",
  },
  {
    name: "Junior Wayfarer", category: "kids", gender: "kids", shape: "wayfarer", rim: "full_rim",
    material: "tr90", colors: ["red_pink", "blue"], size: [46, 16, 130], price: 2600,
    features: ["flexible"], rxCompatible: true, faceShapes: ["round", "oval"],
    description: "A mini wayfarer in cheerful colours with a flexible fit that kids actually keep on.",
  },
  {
    name: "Coastline Wayfarer", category: "sunglasses", gender: "men", shape: "wayfarer", rim: "full_rim",
    material: "acetate", colors: ["black", "brown"], size: [55, 18, 145], price: 4500, compareAtPrice: 5500,
    features: ["polarized", "uv400"], rxCompatible: false, faceShapes: ["round", "oval", "oblong"],
    description: "A timeless wayfarer with polarized UV400 lenses to cut glare on bright days.",
  },
  {
    name: "Sunset Cat-Eye Shades", category: "sunglasses", gender: "women", shape: "cat_eye", rim: "full_rim",
    material: "acetate", colors: ["tortoise", "brown"], size: [54, 16, 140], price: 4900,
    features: ["uv400"], rxCompatible: false, faceShapes: ["round", "square", "diamond", "triangle"],
    description: "Warm tortoise cat-eye shades with UV400 protection and a golden-hour glow.",
  },
  {
    name: "Metro Rectangle", category: "eyeglasses", gender: "men", shape: "rectangle", rim: "half_rim",
    material: "metal", colors: ["grey", "black"], size: [54, 17, 140], price: 3900,
    features: ["adjustable_nose_pads"], rxCompatible: true, faceShapes: ["round", "oval"],
    description: "A clean half-rim rectangle for the office and beyond. Slim, understated and sturdy.",
  },
  {
    name: "Vista Oversized Round", category: "sunglasses", gender: "women", shape: "round", rim: "full_rim",
    material: "mixed", colors: ["gold", "green"], size: [56, 19, 142], price: 5400,
    features: ["uv400", "polarized"], rxCompatible: false, faceShapes: ["square", "oval", "heart"],
    description: "Oversized round shades with polarized UV400 lenses and a fine gold frame.",
  },
];

const LENS_SPECS = [
  {
    name: "Clear Everyday 1.50", price: 1500, features: ["uv400"],
    description: "Standard clear single vision lenses for everyday wear, with anti-scratch and UV400 included.",
    lens: { lensType: "single_vision", index: "1.50", treatment: "clear", coatings: ["anti_scratch", "uv400"], note: "" },
  },
  {
    name: "Thin Blue-Light 1.59", price: 2800, features: ["blue_light", "uv400"],
    description: "Thinner, lighter polycarbonate lenses with a blue-light filter and anti-reflective coating for screen time.",
    lens: {
      lensType: "single_vision", index: "1.59", treatment: "blue_light",
      coatings: ["anti_scratch", "uv400", "blue_light_filter", "anti_reflective"], note: "",
    },
  },
  {
    name: "Ultra-Thin 1.67 Anti-Glare", price: 5500, features: ["uv400"],
    description: "Ultra-thin lenses for stronger prescriptions, with anti-glare and water and oil repellent coatings.",
    lens: {
      lensType: "single_vision", index: "1.67", treatment: "clear",
      coatings: ["anti_scratch", "uv400", "anti_reflective", "water_oil_repellent"], note: "",
    },
  },
  {
    name: "Progressive 1.59 Everyday", price: 7500, features: ["uv400"],
    description: "Progressive lenses that let you see near, far and in between without changing glasses.",
    lens: {
      lensType: "progressive", index: "1.59", treatment: "clear",
      coatings: ["anti_scratch", "uv400", "anti_reflective"],
      rxRange: { sphMin: -8, sphMax: 6, cylMax: 4, addMax: 3.5 }, note: "",
    },
  },
];

const frames = FRAME_SPECS.map((spec, index) => buildFrame(index, spec));
const lenses = LENS_SPECS.map((spec, index) => buildLens(FRAME_SPECS.length + index, spec));

export const SEED_CATALOG = Object.freeze({
  version: 1,
  updatedAt: SEED_UPDATED_AT,
  products: [...frames, ...lenses],
});
