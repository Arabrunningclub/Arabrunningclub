"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/arc-shop/catalog";
import { formatPrice } from "@/lib/arc-shop/catalog";

export type CartLine = {
  product: Product;
  size: string;
  color: string;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (index: number) => void;
  setQuantity: (index: number, quantity: number) => void;
  setDrawerOpen: (open: boolean) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let initialItems: CartLine[] = [];
    try {
      const stored = window.localStorage.getItem("arc-shop-cart");
      if (stored) initialItems = JSON.parse(stored);
    } catch {
      window.localStorage.removeItem("arc-shop-cart");
    }
    queueMicrotask(() => {
      setItems(initialItems);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem("arc-shop-cart", JSON.stringify(items));
    }
  }, [hydrated, items]);

  const addItem = useCallback(
    (product: Product, size: string, color: string) => {
      setItems((current) => {
        const match = current.findIndex(
          (line) =>
            line.product.id === product.id &&
            line.size === size &&
            line.color === color,
        );
        if (match === -1) {
          return [...current, { product, size, color, quantity: 1 }];
        }
        return current.map((line, index) =>
          index === match ? { ...line, quantity: line.quantity + 1 } : line,
        );
      });
      setDrawerOpen(true);
    },
    [],
  );

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((total, line) => total + line.quantity, 0),
      subtotal: items.reduce(
        (total, line) => total + line.product.price * line.quantity,
        0,
      ),
      drawerOpen,
      addItem,
      removeItem: (target: number) =>
        setItems((current) =>
          current.filter((_, index) => index !== target),
        ),
      setQuantity: (target: number, quantity: number) =>
        setItems((current) =>
          current.map((line, index) =>
            index === target
              ? { ...line, quantity: Math.max(1, quantity) }
              : line,
          ),
        ),
      setDrawerOpen,
      clear: () => setItems([]),
    }),
    [addItem, drawerOpen, items],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside StoreProvider");
  return context;
}

function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    drawerOpen,
    removeItem,
    setQuantity,
    setDrawerOpen,
  } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/shop/checkout", {
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

  return (
    <>
      <button
        className={`drawer-scrim ${drawerOpen ? "is-open" : ""}`}
        type="button"
        aria-label="Close shopping bag"
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className={`cart-drawer ${drawerOpen ? "is-open" : ""}`}
        aria-hidden={!drawerOpen}
        aria-label="Shopping bag"
      >
        <div className="drawer-head">
          <div>
            <span className="micro">Your movement kit</span>
            <h2>Bag / {count}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close shopping bag"
          >
            ×
          </button>
        </div>

        <div className="drawer-lines">
          {items.length === 0 ? (
            <div className="empty-bag">
              <span>0 / 00</span>
              <h3>Nothing in motion yet.</h3>
              <p>Build a uniform for every pace.</p>
              <a href="/shop/products" onClick={() => setDrawerOpen(false)}>
                Explore the first drop →
              </a>
            </div>
          ) : (
            items.map((line, index) => (
              <article
                className="drawer-line"
                key={`${line.product.id}-${line.size}-${line.color}`}
              >
                <img src={line.product.image} alt="" />
                <div>
                  <strong>{line.product.name}</strong>
                  <span>
                    {line.color} / {line.size}
                  </span>
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() => setQuantity(index, line.quantity - 1)}
                      aria-label={`Decrease ${line.product.name} quantity`}
                    >
                      −
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(index, line.quantity + 1)}
                      aria-label={`Increase ${line.product.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="drawer-line-end">
                  <span>{formatPrice(line.product.price * line.quantity)}</span>
                  <button type="button" onClick={() => removeItem(index)}>
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-checkout">
            <div className="subtotal">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <p>Taxes and shipping calculated at checkout.</p>
            {error && <p className="form-error">{error}</p>}
            <button
              className="button button-dark button-wide"
              type="button"
              onClick={checkout}
              disabled={loading}
            >
              {loading ? "Opening secure checkout…" : "Checkout securely →"}
            </button>
            <a
              className="drawer-cart-link"
              href="/shop/cart"
              onClick={() => setDrawerOpen(false)}
            >
              Review full bag
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
