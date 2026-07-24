"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { products as fallbackProducts, type Product } from "@/lib/catalog";
import { Logo } from "./Logo";

type AdminProduct = Product & {
  price_cents?: number;
  image_url?: string;
  image_alt?: string;
  sort_order?: number;
  status?: string;
};

type AdminOrder = {
  id: string;
  order_number: number;
  customer_email: string | null;
  total_cents: number;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  order_items?: Array<{ product_name: string; quantity: number }>;
};

const demoOrders: AdminOrder[] = [
  {
    id: "demo-1004",
    order_number: 1004,
    customer_email: "member@arc.community",
    total_cents: 20200,
    payment_status: "paid",
    fulfillment_status: "unfulfilled",
    created_at: new Date().toISOString(),
    order_items: [
      { product_name: "Field Shell", quantity: 1 },
      { product_name: "Unity Heavy Tee", quantity: 1 },
    ],
  },
  {
    id: "demo-1003",
    order_number: 1003,
    customer_email: "runner@example.com",
    total_cents: 7200,
    payment_status: "paid",
    fulfillment_status: "fulfilled",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    order_items: [{ product_name: 'Movement Short 5"', quantity: 1 }],
  },
];

export function AdminDashboard({
  configured,
  adminEmail,
}: {
  configured: boolean;
  adminEmail: string;
}) {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState(adminEmail);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"products" | "orders" | "content">("products");
  const [products, setProducts] = useState<AdminProduct[]>(
    fallbackProducts.map((product, index) => ({
      ...product,
      price_cents: product.price * 100,
      image_url: product.image,
      image_alt: product.imageAlt,
      sort_order: index,
      status: "active",
    })),
  );
  const [orders, setOrders] = useState<AdminOrder[]>(demoOrders);
  const [editing, setEditing] = useState<AdminProduct | null>(null);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashToken = hash.get("access_token");
    const saved = window.localStorage.getItem("arc-shop-admin-token");
    const accessToken = hashToken || saved || "";
    if (hashToken) {
      window.localStorage.setItem("arc-shop-admin-token", hashToken);
      window.history.replaceState({}, "", "/admin");
    }
    queueMicrotask(() => setToken(accessToken));
  }, []);

  useEffect(() => {
    if (!configured || !token) return;
    Promise.all([
      fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([productResponse, orderResponse]) => {
        if (productResponse.ok) setProducts(await productResponse.json());
        if (orderResponse.ok) setOrders(await orderResponse.json());
        if (productResponse.status === 401 || orderResponse.status === 401) {
          window.localStorage.removeItem("arc-shop-admin-token");
          setToken("");
        }
      })
      .catch(() => setMessage("The shop database could not be reached."));
  }, [configured, token]);

  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Could not send the sign-in link.");
      return;
    }
    setSent(true);
  }

  const inventoryCount = useMemo(
    () => products.reduce((total) => total + 20, 0),
    [products],
  );

  if (configured && !token) {
    return (
      <main className="admin-login">
        <div className="admin-login-brand">
          <Logo />
          <span>Control room / Staff only</span>
        </div>
        <form onSubmit={sendMagicLink}>
          <span className="section-label">ARC Shop administration</span>
          <h1>Run the movement.</h1>
          <p>
            Sign in with the authorized ARC email. We will send a secure,
            password-free link.
          </p>
          <label>
            Email
            <input
              value={email}
              type="email"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <button className="button button-dark button-wide" type="submit">
            Send secure sign-in link →
          </button>
          {sent && <p className="admin-success">Check your inbox for the link.</p>}
          {message && <p className="form-error">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-rail">
        <Logo compact />
        <nav>
          <button
            className={tab === "products" ? "active" : ""}
            onClick={() => setTab("products")}
          >
            <span>01</span> Products
          </button>
          <button
            className={tab === "orders" ? "active" : ""}
            onClick={() => setTab("orders")}
          >
            <span>02</span> Orders
          </button>
          <button
            className={tab === "content" ? "active" : ""}
            onClick={() => setTab("content")}
          >
            <span>03</span> Storefront
          </button>
        </nav>
        <Link href="/">View shop ↗</Link>
      </aside>
      <section className="admin-main">
        <header className="admin-header">
          <div>
            <span className="section-label">ARC Shop / Control room</span>
            <h1>{tab}</h1>
          </div>
          <div>
            <span className={`status-dot ${configured ? "live" : ""}`} />
            {configured ? "Supabase connected" : "Preview data"}
          </div>
        </header>

        {!configured && (
          <div className="admin-notice">
            <strong>Preview mode.</strong>
            <span>
              The complete admin is ready. Changes become permanent after the
              Supabase project is connected.
            </span>
          </div>
        )}

        <div className="admin-stats">
          <article>
            <span>Active pieces</span>
            <strong>{products.length.toString().padStart(2, "0")}</strong>
            <small>Drop 001</small>
          </article>
          <article>
            <span>Units available</span>
            <strong>{inventoryCount}</strong>
            <small>Across all variants</small>
          </article>
          <article>
            <span>Open orders</span>
            <strong>
              {orders
                .filter((order) => order.fulfillment_status !== "fulfilled")
                .length.toString()
                .padStart(2, "0")}
            </strong>
            <small>Ready to fulfill</small>
          </article>
        </div>

        {tab === "products" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <span className="section-label">Catalog</span>
                <h2>Products + inventory</h2>
              </div>
              <button
                className="button button-dark"
                type="button"
                onClick={() => setEditing(newBlankProduct())}
              >
                Add a product +
              </button>
            </div>
            <div className="admin-product-list">
              {products.map((product) => (
                <article key={product.id}>
                  <img src={product.image_url || product.image} alt="" />
                  <div>
                    <span>{product.eyebrow}</span>
                    <strong>{product.name}</strong>
                  </div>
                  <span>{product.category}</span>
                  <span>${Math.round((product.price_cents || product.price * 100) / 100)}</span>
                  <span className="stock-good">20 in stock</span>
                  <button type="button" onClick={() => setEditing(product)}>
                    Edit →
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <span className="section-label">Fulfillment</span>
                <h2>Orders</h2>
              </div>
              <button className="admin-filter" type="button">
                All orders ↓
              </button>
            </div>
            <div className="admin-order-list">
              <div className="admin-order-row admin-order-labels">
                <span>Order</span>
                <span>Customer</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
              </div>
              {orders.map((order) => (
                <article className="admin-order-row" key={order.id}>
                  <strong>#{order.order_number}</strong>
                  <span>{order.customer_email || "Awaiting email"}</span>
                  <span>
                    {order.order_items
                      ?.map((item) => `${item.quantity}× ${item.product_name}`)
                      .join(", ") || "Pending"}
                  </span>
                  <strong>${(order.total_cents / 100).toFixed(2)}</strong>
                  <span className={`order-state ${order.fulfillment_status}`}>
                    {order.fulfillment_status}
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === "content" && (
          <section className="admin-content-grid">
            <article>
              <span className="section-label">Homepage / Hero</span>
              <h2>Move as one.</h2>
              <p>
                Technical essentials for training, transit, and everything
                between.
              </p>
              <button type="button">Edit hero copy →</button>
            </article>
            <article className="admin-campaign-card">
              <img src="/images/arc-campaign-hero.webp" alt="" />
              <div>
                <span>Campaign asset</span>
                <strong>Drop 001 / Movement system</strong>
              </div>
            </article>
            <article>
              <span className="section-label">Announcement</span>
              <h2>Free shipping over $100</h2>
              <p>Live across the storefront.</p>
              <button type="button">Change announcement →</button>
            </article>
          </section>
        )}
      </section>

      {editing && (
        <ProductEditor
          product={editing}
          configured={configured}
          token={token}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setProducts((current) => {
              const index = current.findIndex((product) => product.id === saved.id);
              if (index === -1) return [...current, saved];
              return current.map((product) =>
                product.id === saved.id ? saved : product,
              );
            });
            setEditing(null);
          }}
        />
      )}
    </main>
  );
}

function ProductEditor({
  product,
  configured,
  token,
  onClose,
  onSaved,
}: {
  product: AdminProduct;
  configured: boolean;
  token: string;
  onClose: () => void;
  onSaved: (product: AdminProduct) => void;
}) {
  const [draft, setDraft] = useState(product);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function update(field: keyof AdminProduct, value: unknown) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const normalized = {
      ...draft,
      price_cents: Number(draft.price_cents || draft.price * 100),
      image_url: draft.image_url || draft.image,
      image_alt: draft.image_alt || draft.imageAlt,
      colors: draft.colors,
      sizes: draft.sizes,
      status: draft.status || "active",
    };
    if (!configured) {
      onSaved({
        ...draft,
        id: draft.id || crypto.randomUUID(),
        price: normalized.price_cents / 100,
      });
      return;
    }
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(normalized),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Product could not be saved.");
      setSaving(false);
      return;
    }
    onSaved({
      ...draft,
      ...result,
      price: Number(result.price_cents || normalized.price_cents) / 100,
    });
  }

  return (
    <>
      <button className="editor-scrim" type="button" onClick={onClose} />
      <aside className="product-editor">
        <header>
          <div>
            <span className="section-label">Catalog editor</span>
            <h2>{draft.id ? "Edit product" : "New product"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close editor">
            ×
          </button>
        </header>
        <form onSubmit={save}>
          <label>
            Product name
            <input
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              required
            />
          </label>
          <div className="editor-two">
            <label>
              Slug
              <input
                value={draft.slug}
                onChange={(event) => update("slug", event.target.value)}
                required
              />
            </label>
            <label>
              Price / cents
              <input
                type="number"
                min="0"
                value={draft.price_cents || draft.price * 100}
                onChange={(event) =>
                  update("price_cents", Number(event.target.value))
                }
                required
              />
            </label>
          </div>
          <label>
            Short description
            <textarea
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
              rows={4}
            />
          </label>
          <div className="editor-two">
            <label>
              Category
              <select
                value={draft.category}
                onChange={(event) => update("category", event.target.value)}
              >
                <option>Tops</option>
                <option>Outerwear</option>
                <option>Bottoms</option>
                <option>Accessories</option>
              </select>
            </label>
            <label>
              Collection
              <select
                value={draft.collection}
                onChange={(event) => update("collection", event.target.value)}
              >
                <option>Run</option>
                <option>Off-duty</option>
                <option>Objects</option>
              </select>
            </label>
          </div>
          <label>
            Product image URL
            <input
              value={draft.image_url || draft.image}
              onChange={(event) => {
                update("image_url", event.target.value);
                update("image", event.target.value);
              }}
            />
          </label>
          <div className="editor-preview">
            <img src={draft.image_url || draft.image} alt="" />
            <span>
              Media uploads activate with Supabase Storage. Existing public
              URLs work now.
            </span>
          </div>
          <label>
            Sizes / comma separated
            <input
              value={draft.sizes.join(", ")}
              onChange={(event) =>
                update(
                  "sizes",
                  event.target.value
                    .split(",")
                    .map((size) => size.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>
          <label className="editor-check">
            <input
              type="checkbox"
              checked={Boolean(draft.featured)}
              onChange={(event) => update("featured", event.target.checked)}
            />
            Feature this product on the homepage
          </label>
          {message && <p className="form-error">{message}</p>}
          <button
            className="button button-dark button-wide"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save product →"}
          </button>
        </form>
      </aside>
    </>
  );
}

function newBlankProduct(): AdminProduct {
  return {
    id: "",
    slug: "",
    name: "",
    eyebrow: "New / ARC",
    description: "",
    details: ["Built for movement"],
    price: 0,
    price_cents: 0,
    image: "/images/unity-heavy-tee.webp",
    image_url: "/images/unity-heavy-tee.webp",
    imageAlt: "ARC product",
    image_alt: "ARC product",
    category: "Tops",
    collection: "Off-duty",
    colors: [{ name: "Ink", hex: "#151513" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: false,
    badge: "New",
    status: "active",
  };
}
