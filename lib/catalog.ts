export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  group: string;
  price: number;
  original: number;
  stock: number;
  image: string;
  hoverImage?: string;
  description: string;
  featured: boolean;
};
export const categories = [
  "Televisions",
  "Refrigerators",
  "Washing Machines",
  "Air Conditioners",
  "Kitchen Appliances",
  "Mobile & Accessories",
  "Sofas",
  "Beds",
  "Dining Tables",
  "Wardrobes",
  "Office Furniture",
  "Chairs",
];
export const seed: Product[] = [
  {
    id: "cloud-sofa",
    name: "Cloud 3-Seater Fabric Sofa",
    brand: "Liyas Living",
    category: "Sofas",
    group: "Furniture",
    price: 28990,
    original: 39990,
    stock: 8,
    image: "/images/sofa.jpg",
    description:
      "Soft upholstery, generous seating and a timeless silhouette for everyday living. Shown as an illustrative sample; confirm materials and dimensions with the showroom.",
    featured: true,
  },
  {
    id: "smart-tv",
    name: "Smart LED Television",
    brand: "LG",
    category: "Televisions",
    group: "Electronics",
    price: 42990,
    original: 59990,
    stock: 6,
    image: "/images/tv.jpg",
    description:
      "A big-screen upgrade for movie nights and everyday entertainment. Illustrative catalogue item; exact model and specifications will be confirmed by the showroom.",
    featured: true,
  },
  {
    id: "refrigerator",
    name: "Double Door Refrigerator",
    brand: "LG",
    category: "Refrigerators",
    group: "Electronics",
    price: 26990,
    original: 34990,
    stock: 5,
    image: "/images/fridge.jpg",
    description:
      "Thoughtful cooling and room for your everyday essentials. Illustrative sample; capacity and model to be confirmed.",
    featured: true,
  },
  {
    id: "dining-table",
    name: "Classic Dining Table Set",
    brand: "Liyas Living",
    category: "Dining Tables",
    group: "Furniture",
    price: 22990,
    original: 31990,
    stock: 4,
    image: "/images/dining.jpg",
    description:
      "A welcoming place for family meals and conversations. Illustrative sample; finish and dimensions to be confirmed.",
    featured: true,
  },
  {
    id: "accent-chair",
    name: "Everyday Lounge Chair",
    brand: "Liyas Living",
    category: "Chairs",
    group: "Furniture",
    price: 8990,
    original: 11990,
    stock: 10,
    image: "/images/chair.jpg",
    hoverImage: "/images/chair-1.jpg",
    
    description: "An easy addition to your favourite corner. Illustrative catalogue item.",
    featured: false,
  },
  {
    id: "washer",
    name: "Front Load Washing Machine",
    brand: "Bosch",
    category: "Washing Machines",
    group: "Electronics",
    price: 32990,
    original: 42990,
    stock: 3,
    image: "/images/washer.jpg",
    description:
      "Make laundry days simpler. Illustrative catalogue item; exact capacity and model to be confirmed.",
    featured: false,
  },
  {
    id: "bed",
    name: "Classic King Size Bed",
    brand: "Liyas Living",
    category: "Beds",
    group: "Furniture",
    price: 24990,
    original: 32990,
    stock: 4,
    image: "/images/bed.jpg",
    description:
      "A comfortable foundation for a restful room. Illustrative catalogue item; mattress sold separately.",
    featured: false,
  },
  {
    id: "kitchen",
    name: "Everyday Stand Mixer",
    brand: "KitchenAid",
    category: "Kitchen Appliances",
    group: "Electronics",
    price: 4990,
    original: 6990,
    stock: 7,
    image: "/images/kitchen.jpg",
    description:
      "Practical essentials for your home kitchen. Illustrative sample; exact product to be confirmed.",
    featured: false,
  },
];
export const money = (n: number) => "₹" + n.toLocaleString("en-IN");
