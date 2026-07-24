import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <article className="product-card" data-reveal>
      <Link className="product-media" href={`/product/${product.slug}`}>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <img
          src={product.image}
          alt={product.imageAlt}
          loading={priority ? "eager" : "lazy"}
        />
        <span className="product-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
      <Link className="product-meta" href={`/product/${product.slug}`}>
        <div>
          <span>{product.eyebrow}</span>
          <h3>{product.name}</h3>
          <small>
            {product.colors.length} colors · {product.category}
          </small>
        </div>
        <strong>{formatPrice(product.price)}</strong>
      </Link>
    </article>
  );
}
