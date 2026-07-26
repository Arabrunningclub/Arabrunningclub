import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBag } from "@/components/arc-shop/AddToBag";
import { Footer } from "@/components/arc-shop/Footer";
import { Header } from "@/components/arc-shop/Header";
import { ProductCard } from "@/components/arc-shop/ProductCard";
import { formatPrice, products } from "@/lib/arc-shop/catalog";
import {
  getStorefrontProduct,
  getStorefrontProducts,
  getProductGalleryImages,
} from "@/lib/arc-shop/storefront";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.image] },
  };
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);
  if (!product) notFound();
  const galleryImages = await getProductGalleryImages(product.id);
  const productImages = [product.image, ...galleryImages];
  const catalog = await getStorefrontProducts();
  const related = catalog
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  return (
    <>
      <Header />
      <main className="product-page">
        <div className="product-breadcrumb">
          <Link href="/shop/products">Shop</Link>
          <span>/</span>
          <span>{product.category}</span>
        </div>
        <section className="product-layout">
          <div className="product-gallery">
            <div className="product-main-image">
              <span className="image-index">
                01 / {productImages.length.toString().padStart(2, "0")}
              </span>
              <img src={product.image} alt={product.imageAlt} />
            </div>
            <div className="product-detail-tile product-detail-copy">
              <span>{product.eyebrow}</span>
              <strong>Designed for repeat wear.</strong>
            </div>
            {productImages.slice(1).map((image, index) => (
              <div className="product-detail-tile product-detail-image" key={image}>
                <span className="image-index">
                  {(index + 2).toString().padStart(2, "0")} /{" "}
                  {productImages.length.toString().padStart(2, "0")}
                </span>
                <img src={image} alt={`${product.name} view ${index + 2}`} />
              </div>
            ))}
          </div>
          <aside className="product-info">
            <span className="section-label">{product.eyebrow}</span>
            <h1>{product.name}</h1>
            <strong className="product-price">{formatPrice(product.price)}</strong>
            <p>{product.description}</p>
            <AddToBag product={product} />
            <details open>
              <summary>Details</summary>
              <ul>
                {product.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </details>
            <details>
              <summary>Fit + care</summary>
              <p>
                True-to-size relaxed fit. Machine wash cold with like colors;
                hang dry to preserve performance and shape.
              </p>
            </details>
            <details>
              <summary>Shipping + returns</summary>
              <p>
                Free U.S. shipping over $100. Unworn pieces may be returned
                within 30 days.
              </p>
            </details>
          </aside>
        </section>
        <section className="related-products">
          <div className="section-heading">
            <div>
              <span className="section-label">Keep moving</span>
              <h2>Build the system.</h2>
            </div>
          </div>
          <div className="featured-grid">
            {related.map((item) => (
              <ProductCard product={item} key={item.id} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
