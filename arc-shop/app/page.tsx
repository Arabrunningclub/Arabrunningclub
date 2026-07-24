import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { collections } from "@/lib/catalog";
import { getStorefrontProducts } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "ARC Shop — Movement apparel for every pace",
  description:
    "Technical apparel and considered daily uniform from Arab Recreational Club. Designed in Detroit for movement, transit, and everything between.",
};

export default async function Home() {
  const products = await getStorefrontProducts();
  const featured = products.filter((product) => product.featured);

  return (
    <>
      <Header />
      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <div className="hero-kicker">Arab Recreational Club / Drop 001</div>
            <h1>
              <span>Move</span>
              <span>as one.</span>
            </h1>
            <p>
              Technical essentials for training, transit, and everything
              between.
            </p>
            <div className="hero-actions">
              <Link className="button button-light" href="/shop">
                Shop the drop <span>↗</span>
              </Link>
              <a className="text-link" href="#manifesto">
                Our story <span>→</span>
              </a>
            </div>
            <span className="hero-index">01 / First movement</span>
          </div>
          <div className="hero-image">
            <img
              src="/images/arc-campaign-hero.webp"
              alt="Three athletes wearing ARC movement apparel in Detroit"
            />
            <span className="hero-image-caption">
              Engineered for the hours between
            </span>
            <div className="hero-orbit" aria-hidden="true">
              <span>ARC</span>
              <i />
            </div>
          </div>
        </section>

        <div className="movement-ticker" aria-label="ARC movement principles">
          <div>
            <span>Run together</span>
            <span>Made to move</span>
            <span>Detroit / Everywhere</span>
            <span>Every pace belongs</span>
            <span>Run together</span>
            <span>Made to move</span>
            <span>Detroit / Everywhere</span>
            <span>Every pace belongs</span>
          </div>
        </div>

        <section className="collection-band" data-reveal>
          <span className="section-label">Shop by movement</span>
          <div className="collection-links">
            {collections.map((collection, index) => (
              <Link
                href={`/shop?collection=${collection.name.toLowerCase()}`}
                key={collection.name}
              >
                <span>0{index + 1}</span>
                <strong>{collection.name}</strong>
                <small>{collection.description}</small>
                <i>↗</i>
              </Link>
            ))}
          </div>
        </section>

        <section className="first-drop" id="drop">
          <div className="section-heading" data-reveal>
            <div>
              <span className="section-label">The first drop / 001</span>
              <h2>Uniform for motion.</h2>
            </div>
            <p>
              Considered layers, technical fabrics, and a club-first point of
              view. Five pieces. No filler.
            </p>
            <Link className="text-link dark" href="/shop">
              View all pieces <span>→</span>
            </Link>
          </div>
          <div className="featured-grid">
            {featured.map((product, index) => (
              <ProductCard
                product={product}
                priority={index === 0}
                key={product.id}
              />
            ))}
          </div>
        </section>

        <section className="manifesto-panel" id="manifesto">
          <div className="manifesto-code" data-reveal>
            <span>ARC / Detroit, MI</span>
            <span>Est. forward</span>
          </div>
          <div className="manifesto-copy" data-reveal>
            <span className="section-label">More than apparel</span>
            <h2>
              The route changes.
              <br />
              The reason stays.
            </h2>
            <p>
              ARC began with the belief that movement makes room for people.
              The shop carries that forward: apparel that works hard, wears
              easy, and reminds us we never move alone.
            </p>
            <Link className="button button-outline" href="/shop">
              Meet the system <span>→</span>
            </Link>
          </div>
          <div className="manifesto-visual" data-reveal>
            <img
              src="/images/arc-campaign-hero.webp"
              alt="ARC athletes moving together"
            />
            <span>People in motion / 1,800+</span>
          </div>
        </section>

        <section className="field-notes" data-reveal>
          <div>
            <span className="section-label">Field notes / 01</span>
            <h2>Made for your actual day.</h2>
          </div>
          <div className="field-note-grid">
            <article>
              <span>06:12</span>
              <h3>The first mile</h3>
              <p>Low light. Cool air. Nothing extra.</p>
            </article>
            <article>
              <span>12:40</span>
              <h3>Across town</h3>
              <p>One system that moves between plans.</p>
            </article>
            <article>
              <span>19:08</span>
              <h3>Club pace</h3>
              <p>Built for the part where everyone arrives.</p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
