"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "./StoreProvider";

export function CheckoutSuccess({ demo }: { demo: boolean }) {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <section className="success-page">
      <div className="success-mark" aria-hidden="true">
        <span>✓</span>
      </div>
      <span className="section-label">
        {demo ? "Store preview / Demo order" : "Order received"}
      </span>
      <h1>Movement confirmed.</h1>
      <p>
        {demo
          ? "The storefront flow is working. Live payment and confirmation will activate when Stripe and Supabase are connected."
          : "We have your order. A confirmation is heading to your inbox, and we’ll send tracking as soon as it moves."}
      </p>
      <div className="success-actions">
        <Link className="button button-dark" href="/shop">
          Keep exploring →
        </Link>
        <Link className="text-link dark" href="/">
          Back home
        </Link>
      </div>
    </section>
  );
}
