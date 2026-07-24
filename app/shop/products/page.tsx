import type { Metadata } from "next";
import { Footer } from "@/components/arc-shop/Footer";
import { Header } from "@/components/arc-shop/Header";
import { ProductCard } from "@/components/arc-shop/ProductCard";
import { getStorefrontProducts } from "@/lib/arc-shop/storefront";

export const metadata: Metadata = {
  title: "Shop the first drop",
  description:
    "Explore ARC technical apparel, daily uniform, and movement objects.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>;
}) {
  const { collection } = await searchParams;
  const products = await getStorefrontProducts();
  const normalized = collection?.replace("-", " ").toLowerCase();
  const visibleProducts = normalized
    ? products.filter(
        (product) => product.collection.toLowerCase() === normalized,
      )
    : products;

  return (
    <>
      <Header />
      <main className="shop-page">
        <section className="shop-intro">
          <span className="section-label">ARC system / Drop 001</span>
          <h1>{collection ? collection.replace("-", " ") : "All pieces"}</h1>
          <p>
            Five considered pieces for the miles, meetings, and movement in
            between.
          </p>
        </section>
        <div className="shop-toolbar">
          <span>{visibleProducts.length} pieces</span>
          <nav aria-label="Filter products">
            <a className={!collection ? "active" : ""} href="/shop/products">
              All
            </a>
            <a
              className={normalized === "run" ? "active" : ""}
              href="/shop/products?collection=run"
            >
              Run
            </a>
            <a
              className={normalized === "off duty" ? "active" : ""}
              href="/shop/products?collection=off-duty"
            >
              Off-duty
            </a>
            <a
              className={normalized === "objects" ? "active" : ""}
              href="/shop/products?collection=objects"
            >
              Objects
            </a>
          </nav>
          <button type="button">Sort / Featured</button>
        </div>
        <section className="catalog-grid" aria-label="Products">
          {visibleProducts.map((product, index) => (
            <ProductCard
              product={product}
              priority={index < 2}
              key={product.id}
            />
          ))}
        </section>
        <section className="shop-promise" data-reveal>
          <span>One drop. Every pace.</span>
          <p>
            Designed in Detroit. Tested through real club miles. Built to stay
            in rotation.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
