"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "./StoreProvider";

export function CartPage() {
  const { items, subtotal, removeItem, setQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map((line) => ({
            productId: line.product.id,
            slug: line.product.slug,
            size: line.size,
            color: line.color,
            quantity: line.quantity,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Checkout failed.");
      window.location.href = result.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout failed.",
      );
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="cart-empty">
        <span className="section-label">Bag / 00</span>
        <h1>Nothing in motion yet.</h1>
        <p>Start with the first drop and build your daily system.</p>
        <Link className="button button-dark" href="/shop">
          Shop all pieces →
        </Link>
      </section>
    );
  }

  return (
    <section className="cart-page-content">
      <div className="cart-title">
        <span className="section-label">Your movement kit</span>
        <h1>Bag / {items.reduce((sum, item) => sum + item.quantity, 0)}</h1>
      </div>
      <div className="cart-layout">
        <div className="cart-lines">
          {items.map((line, index) => (
            <article
              className="cart-line"
              key={`${line.product.id}-${line.size}-${line.color}`}
            >
              <Link href={`/product/${line.product.slug}`}>
                <img src={line.product.image} alt={line.product.imageAlt} />
              </Link>
              <div className="cart-line-copy">
                <span>{line.product.eyebrow}</span>
                <h2>{line.product.name}</h2>
                <p>
                  {line.color} / {line.size}
                </p>
                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={() => setQuantity(index, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(index, line.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="cart-line-price">
                <strong>
                  {formatPrice(line.product.price * line.quantity)}
                </strong>
                <button type="button" onClick={() => removeItem(index)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
        <aside className="order-summary">
          <span className="section-label">Order summary</span>
          <div>
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div>
            <span>Shipping</span>
            <strong>{subtotal >= 100 ? "Free" : "Calculated"}</strong>
          </div>
          <div className="summary-total">
            <span>Estimated total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <p>Taxes calculated at checkout.</p>
          {error && <p className="form-error">{error}</p>}
          <button
            className="button button-light button-wide"
            type="button"
            onClick={checkout}
            disabled={loading}
          >
            {loading ? "Opening secure checkout…" : "Checkout securely →"}
          </button>
          <div className="summary-marks">
            <span>Secure Stripe checkout</span>
            <span>30-day returns</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
