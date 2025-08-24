import pd01 from '../assets/images/pd_01.png';
import pd02 from '../assets/images/pd_02.png';

export const products = [
  {
    id: 1,
    name: "Classic Round Metal Frame",
    description: "Timeless round metal frames with premium finish. Perfect for both formal and casual occasions. Features anti-glare coating and UV protection.",
    price: 7999,
    images: [pd01],
    tags: ['sun-glasses', 'men'],
    features: [
      "Premium metal construction",
      "Anti-glare coating",
      "UV protection",
      "Adjustable nose pads",
      "Spring hinges for comfort"
    ],
    specifications: {
      frameWidth: "138mm",
      lensWidth: "50mm",
      bridgeWidth: "18mm",
      templeLength: "140mm",
      material: "Stainless Steel",
      weight: "15g"
    }
  },
  {
    id: 2,
    name: "Modern Square Acetate Frame",
    description: "Contemporary square frames crafted from premium Italian acetate. Features blue light filtering and comes with a designer case.",
    price: 9999,
    images: [pd02],
    tags: ['sun-glasses', 'women', 'lens'],
    features: [
      "Italian acetate material",
      "Blue light filtering",
      "Scratch-resistant coating",
      "Premium case included",
      "Lightweight design"
    ],
    specifications: {
      frameWidth: "142mm",
      lensWidth: "52mm",
      bridgeWidth: "19mm",
      templeLength: "145mm",
      material: "Italian Acetate",
      weight: "22g"
    }
  }
];