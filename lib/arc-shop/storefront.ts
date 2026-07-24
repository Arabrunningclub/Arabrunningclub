import { products as fallbackProducts, type Product } from "./catalog";

type StorefrontRow = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  details: string[];
  price_cents: number;
  image_url: string;
  image_alt: string;
  category: Product["category"];
  collection: Product["collection"];
  colors: Product["colors"];
  sizes: string[];
  featured: boolean;
  badge: string | null;
};

export async function getStorefrontProducts(): Promise<Product[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return fallbackProducts;

  try {
    const response = await fetch(
      `${url}/rest/v1/storefront_products?select=*&order=sort_order.asc`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        next: { revalidate: 60 },
      },
    );
    if (!response.ok) return fallbackProducts;
    const rows = (await response.json()) as StorefrontRow[];
    if (!rows.length) return fallbackProducts;
    return rows.map(mapStorefrontRow);
  } catch {
    return fallbackProducts;
  }
}

export async function getStorefrontProduct(slug: string) {
  const products = await getStorefrontProducts();
  return products.find((product) => product.slug === slug);
}

function mapStorefrontRow(row: StorefrontRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    eyebrow: row.eyebrow,
    description: row.description,
    details: row.details ?? [],
    price: Math.round(row.price_cents / 100),
    image: row.image_url,
    imageAlt: row.image_alt,
    category: row.category,
    collection: row.collection,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    featured: row.featured,
    badge: row.badge ?? undefined,
  };
}
