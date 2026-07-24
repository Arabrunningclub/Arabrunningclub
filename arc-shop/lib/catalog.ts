export type ProductColor = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  details: string[];
  price: number;
  image: string;
  imageAlt: string;
  category: "Tops" | "Outerwear" | "Bottoms" | "Accessories";
  collection: "Run" | "Off-duty" | "Objects";
  colors: ProductColor[];
  sizes: string[];
  featured?: boolean;
  badge?: string;
};

export const products: Product[] = [
  {
    id: "71b32848-5cb1-4ee8-857b-0048ac54e141",
    slug: "unity-heavy-tee",
    name: "Unity Heavy Tee",
    eyebrow: "01 / Core",
    description:
      "A structured everyday tee cut with room to move. Dense, soft cotton holds its shape from warm-up to wind-down.",
    details: ["280 GSM combed cotton", "Relaxed unisex fit", "Reinforced collar", "Made for daily rotation"],
    price: 54,
    image: "/images/unity-heavy-tee.webp",
    imageAlt: "Black heavyweight ARC Unity Tee on limestone",
    category: "Tops",
    collection: "Off-duty",
    colors: [
      { name: "Ink", hex: "#151513" },
      { name: "Bone", hex: "#eee8dc" },
      { name: "Track", hex: "#355844" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    featured: true,
    badge: "New",
  },
  {
    id: "98d896ee-30d9-4b76-a4fe-e2e0bb4015d7",
    slug: "field-shell",
    name: "Field Shell",
    eyebrow: "02 / Weather",
    description:
      "A packable weather layer with quiet structure, mapped ventilation, and just enough protection for miles between forecasts.",
    details: ["Wind-resistant ripstop", "PFC-free water repellency", "Packable hood", "Two-way front zip"],
    price: 148,
    image: "/images/field-shell.webp",
    imageAlt: "Track green ARC Field Shell jacket",
    category: "Outerwear",
    collection: "Run",
    colors: [
      { name: "Track", hex: "#355844" },
      { name: "Ink", hex: "#151513" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    featured: true,
    badge: "Limited",
  },
  {
    id: "41ecbf59-2080-4521-992d-71e889235557",
    slug: "movement-short-5",
    name: 'Movement Short 5"',
    eyebrow: "03 / Pace",
    description:
      "Fast, unfussy movement shorts with a clean waistband and secure storage that disappears once you start moving.",
    details: ["Lightweight stretch woven", "Bonded phone pocket", "Quick-dry liner", "Reflective rear detail"],
    price: 72,
    image: "/images/movement-short.webp",
    imageAlt: "Bone ARC Movement Shorts on track green",
    category: "Bottoms",
    collection: "Run",
    colors: [
      { name: "Bone", hex: "#eee8dc" },
      { name: "Ink", hex: "#151513" },
      { name: "Oxide", hex: "#ad3b2d" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    featured: true,
    badge: "Core",
  },
  {
    id: "035ab0d0-8a29-4832-b539-11db8ad92c68",
    slug: "transit-warmup-pant",
    name: "Transit Warmup Pant",
    eyebrow: "04 / Transit",
    description:
      "An articulated technical pant built to layer, commute, and move without the familiar track-pant noise.",
    details: ["Four-way stretch weave", "Articulated knee", "Locking ankle zips", "Five secure pockets"],
    price: 118,
    image: "/images/transit-pant.webp",
    imageAlt: "Black ARC Transit Warmup Pant on limestone",
    category: "Bottoms",
    collection: "Off-duty",
    colors: [
      { name: "Ink", hex: "#151513" },
      { name: "Track", hex: "#355844" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    badge: "New",
  },
  {
    id: "4a5ffea5-68a7-4456-8b50-2d196e40f5f8",
    slug: "route-five-panel",
    name: "Route Five-Panel",
    eyebrow: "05 / Objects",
    description:
      "A low-profile movement cap with laser-cut airflow and a pliable brim that packs without losing its line.",
    details: ["Featherweight stretch shell", "Laser-cut ventilation", "Adjustable cord lock", "Hand-washable"],
    price: 38,
    image: "/images/route-cap.webp",
    imageAlt: "Oxide red ARC Route Five-Panel cap",
    category: "Accessories",
    collection: "Objects",
    colors: [
      { name: "Oxide", hex: "#ad3b2d" },
      { name: "Ink", hex: "#151513" },
      { name: "Bone", hex: "#eee8dc" },
    ],
    sizes: ["One size"],
    badge: "New",
  },
];

export const collections = [
  { name: "Run", description: "Light, fast, weather-ready." },
  { name: "Off-duty", description: "Daily uniform, considered." },
  { name: "Objects", description: "The useful things between." },
] as const;

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
