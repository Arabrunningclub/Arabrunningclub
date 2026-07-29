"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  normalizeShopImageUrl,
  products as fallbackProducts,
  type Product,
} from "@/lib/arc-shop/catalog";
import { Logo } from "./Logo";

type AdminProduct = Product & {
  price_cents?: number;
  image_url?: string;
  image_alt?: string;
  sort_order?: number;
  status?: string;
  variants?: ProductVariant[];
};

type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color: string;
  stock_on_hand: number;
  reserved: number;
  active: boolean;
};

type GalleryImage = {
  path: string;
  publicUrl: string;
};

type AdminOrder = {
  id: string;
  order_number: number;
  customer_email: string | null;
  total_cents: number;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  expires_at?: string | null;
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
  previewAccess,
}: {
  configured: boolean;
  adminEmail: string;
  previewAccess: boolean;
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
      variants: product.sizes.flatMap((size) =>
        product.colors.map((color) => ({
          id: `${product.id}-${size}-${color.name}`,
          product_id: product.id,
          sku: `${product.slug}-${size}-${color.name}`,
          size,
          color: color.name,
          stock_on_hand: 20,
          reserved: 0,
          active: true,
        })),
      ),
    })),
  );
  const [orders, setOrders] = useState<AdminOrder[]>(demoOrders);
  const [orderFilter, setOrderFilter] = useState<
    "all" | "open" | "paid" | "cancelled"
  >("all");
  const [orderBusy, setOrderBusy] = useState("");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [stockProduct, setStockProduct] = useState<AdminProduct | null>(null);
  const [updatingId, setUpdatingId] = useState("");
  const [archivedProduct, setArchivedProduct] =
    useState<AdminProduct | null>(null);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashToken = hash.get("access_token");
    const saved = window.localStorage.getItem("arc-shop-admin-token");
    const accessToken = hashToken || saved || "";
    if (hashToken) {
      window.localStorage.setItem("arc-shop-admin-token", hashToken);
      window.history.replaceState({}, "", "/shop/admin");
    }
    queueMicrotask(() => setToken(accessToken));
  }, []);

  useEffect(() => {
    if (!configured || (!token && !previewAccess)) return;
    Promise.all([
      fetch("/api/shop/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("/api/shop/admin/orders", {
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
  }, [configured, previewAccess, token]);

  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/shop/auth/magic-link", {
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
    () =>
      products
        .filter((product) => (product.status || "active") === "active")
        .reduce(
          (total, product) =>
            total +
            (product.variants || []).reduce(
              (variantTotal, variant) =>
                variantTotal + variant.stock_on_hand,
              0,
            ),
          0,
        ),
    [products],
  );
  const visibleOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (orderFilter === "open") {
          return (
            order.fulfillment_status !== "fulfilled" &&
            order.fulfillment_status !== "cancelled"
          );
        }
        if (orderFilter === "paid") return order.payment_status === "paid";
        if (orderFilter === "cancelled") {
          return (
            order.payment_status === "cancelled" ||
            order.fulfillment_status === "cancelled"
          );
        }
        return true;
      }),
    [orderFilter, orders],
  );

  async function updateOrder(
    order: AdminOrder,
    body: Record<string, unknown>,
  ) {
    if (orderBusy) return;
    setOrderBusy(order.id);
    setMessage("");
    try {
      const response = await fetch("/api/shop/admin/orders", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id: order.id, ...body }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Order could not be updated.");
      }
      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? { ...item, ...result, order_items: item.order_items }
            : item,
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Order could not be updated.",
      );
    } finally {
      setOrderBusy("");
    }
  }

  async function cancelOrder(order: AdminOrder) {
    const paidWarning =
      order.payment_status === "paid"
        ? " This cancels fulfillment but does not issue a Stripe refund."
        : "";
    if (!window.confirm(`Cancel order #${order.order_number}?${paidWarning}`)) {
      return;
    }
    await updateOrder(order, { action: "cancel" });
  }

  async function removeOrderSession(order: AdminOrder) {
    if (
      orderBusy ||
      !window.confirm(
        `Remove checkout session #${order.order_number}? Paid order history is always protected.`,
      )
    ) {
      return;
    }
    setOrderBusy(order.id);
    setMessage("");
    try {
      const response = await fetch(
        `/api/shop/admin/orders?id=${encodeURIComponent(order.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Session could not be removed.");
      }
      setOrders((current) =>
        current.filter((item) => item.id !== order.id),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Session could not be removed.",
      );
    } finally {
      setOrderBusy("");
    }
  }

  async function updateProductStatus(
    product: AdminProduct,
    status: "active" | "disabled" | "archived",
  ) {
    if (updatingId) return;
    setUpdatingId(product.id);
    setMessage("");

    try {
      if (configured) {
        const response = await fetch("/api/shop/admin/products", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ id: product.id, status }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Product status could not be changed.");
        }
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, status } : item,
        ),
      );
      if (status === "archived") setArchivedProduct(product);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Product status could not be changed.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function undoDelete() {
    if (!archivedProduct) return;
    const product = archivedProduct;
    setArchivedProduct(null);

    try {
      if (configured) {
        const response = await fetch("/api/shop/admin/products", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ ...product, status: "active" }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Product could not be restored.");
        }
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, status: "active" } : item,
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Product could not be restored.",
      );
      setArchivedProduct(product);
    }
  }

  async function permanentlyDeleteProduct(product: AdminProduct) {
    if (
      product.status !== "archived" ||
      updatingId ||
      !window.confirm(
        `Permanently delete ${product.name}? This cannot be undone.`,
      )
    ) {
      return;
    }

    setUpdatingId(product.id);
    setMessage("");
    try {
      if (configured) {
        const response = await fetch(
          `/api/shop/admin/products?id=${encodeURIComponent(product.id)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Product could not be deleted.");
        }
      }
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      if (archivedProduct?.id === product.id) setArchivedProduct(null);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Product could not be deleted.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  if (configured && !token && !previewAccess) {
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
      </aside>
      <Link className="admin-view-shop" href="/shop">
        View storefront <span>↗</span>
      </Link>
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
            <strong>
              {products
                .filter((product) => (product.status || "active") === "active")
                .length.toString()
                .padStart(2, "0")}
            </strong>
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
            {message && <p className="admin-inline-error">{message}</p>}
            <div className="admin-product-list">
              {products.map((product) => (
                <SwipeableProductRow
                  key={product.id}
                  product={product}
                  updating={updatingId === product.id}
                  onArchive={() =>
                    updateProductStatus(product, "archived")
                  }
                  onDelete={() => permanentlyDeleteProduct(product)}
                  onToggleDisabled={() =>
                    updateProductStatus(
                      product,
                      product.status === "disabled" ||
                        product.status === "archived"
                        ? "active"
                        : "disabled",
                    )
                  }
                  onEdit={() => setEditing(product)}
                  onStock={() => setStockProduct(product)}
                />
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
              <select
                className="admin-filter"
                aria-label="Filter orders"
                value={orderFilter}
                onChange={(event) =>
                  setOrderFilter(
                    event.target.value as typeof orderFilter,
                  )
                }
              >
                <option value="all">All orders</option>
                <option value="open">Open</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {message && <p className="admin-inline-error">{message}</p>}
            <div className="admin-order-list">
              <div className="admin-order-row admin-order-labels">
                <span>Order</span>
                <span>Customer</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {visibleOrders.map((order) => (
                <article className="admin-order-row" key={order.id}>
                  <strong>#{order.order_number}</strong>
                  <span>{order.customer_email || "Awaiting email"}</span>
                  <span>
                    {order.order_items
                      ?.map((item) => `${item.quantity}× ${item.product_name}`)
                      .join(", ") || "Pending"}
                  </span>
                  <strong>${(order.total_cents / 100).toFixed(2)}</strong>
                  <div className="order-statuses">
                    <span className={`order-state ${order.payment_status}`}>
                      {order.payment_status}
                    </span>
                    <span className={`order-state ${order.fulfillment_status}`}>
                      {order.fulfillment_status}
                    </span>
                  </div>
                  <div className="order-actions">
                    {order.fulfillment_status === "unfulfilled" && (
                      <button
                        type="button"
                        disabled={orderBusy === order.id}
                        onClick={() =>
                          updateOrder(order, {
                            fulfillment_status: "processing",
                          })
                        }
                      >
                        Process
                      </button>
                    )}
                    {order.payment_status === "paid" &&
                      order.fulfillment_status !== "fulfilled" &&
                      order.fulfillment_status !== "cancelled" && (
                        <button
                          type="button"
                          disabled={orderBusy === order.id}
                          onClick={() =>
                            updateOrder(order, {
                              fulfillment_status: "fulfilled",
                            })
                          }
                        >
                          Fulfilled
                        </button>
                      )}
                    {order.fulfillment_status !== "cancelled" &&
                      order.fulfillment_status !== "fulfilled" && (
                        <button
                          className="danger"
                          type="button"
                          disabled={orderBusy === order.id}
                          onClick={() => cancelOrder(order)}
                        >
                          Cancel
                        </button>
                      )}
                    {["pending", "failed", "cancelled"].includes(
                      order.payment_status,
                    ) && (
                      <button
                        className="danger"
                        type="button"
                        disabled={orderBusy === order.id}
                        onClick={() => removeOrderSession(order)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
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
              <img src="/shop/images/arc-campaign-hero.webp" alt="" />
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
      {stockProduct && (
        <StockEditor
          product={stockProduct}
          configured={configured}
          token={token}
          onClose={() => setStockProduct(null)}
          onSaved={(variants) => {
            setProducts((current) =>
              current.map((product) =>
                product.id === stockProduct.id
                  ? { ...product, variants }
                  : product,
              ),
            );
            setStockProduct(null);
          }}
        />
      )}
      {archivedProduct && (
        <div className="admin-toast" role="status">
          <div>
            <strong>{archivedProduct.name}</strong>
            <span>Archived and hidden from the storefront.</span>
          </div>
          <button type="button" onClick={undoDelete}>
            Undo
          </button>
          <button
            className="admin-toast-close"
            type="button"
            aria-label="Dismiss"
            onClick={() => setArchivedProduct(null)}
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}

function SwipeableProductRow({
  product,
  updating,
  onArchive,
  onDelete,
  onToggleDisabled,
  onEdit,
  onStock,
}: {
  product: AdminProduct;
  updating: boolean;
  onArchive: () => void;
  onDelete: () => void;
  onToggleDisabled: () => void;
  onEdit: () => void;
  onStock: () => void;
}) {
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const reveal = 92;
  const totalStock = (product.variants || []).reduce(
    (total, variant) => total + variant.stock_on_hand,
    0,
  );

  function pointerDown(event: React.PointerEvent<HTMLElement>) {
    startX.current = event.clientX - offset;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!dragging) return;
    const next = Math.max(
      -reveal,
      Math.min(reveal, event.clientX - startX.current),
    );
    setOffset(next);
  }

  function pointerUp(event: React.PointerEvent<HTMLElement>) {
    if (!dragging) return;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    setOffset(Math.abs(offset) > 54 ? Math.sign(offset) * reveal : 0);
  }

  return (
    <div className="swipe-product">
      <button
        className="swipe-delete swipe-delete-left"
        type="button"
        onClick={product.status === "archived" ? onDelete : onArchive}
        disabled={updating}
      >
        {updating
          ? "Saving…"
          : product.status === "archived"
            ? "Delete"
            : "Archive"}
      </button>
      <button
        className="swipe-delete swipe-delete-right"
        type="button"
        onClick={product.status === "archived" ? onDelete : onArchive}
        disabled={updating}
      >
        {updating
          ? "Saving…"
          : product.status === "archived"
            ? "Delete"
            : "Archive"}
      </button>
      <article
        className={`${dragging ? "is-swiping " : ""}status-${product.status || "active"}`}
        style={{ transform: `translate3d(${offset}px, 0, 0)` }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      >
        <img
          src={normalizeShopImageUrl(product.image_url || product.image)}
          alt=""
        />
        <div className="admin-product-copy">
          <span>{product.eyebrow}</span>
          <strong>{product.name}</strong>
        </div>
        <span className="admin-product-category">{product.category}</span>
        <span className="admin-product-price">
          ${Math.round((product.price_cents || product.price * 100) / 100)}
        </span>
        <span className={`product-status status-${product.status || "active"}`}>
          {product.status || "active"} · {totalStock} in stock
        </span>
        <div
          className="admin-product-actions"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button type="button" onClick={onEdit}>
            Edit
          </button>
          <button type="button" onClick={onStock}>
            Stock
          </button>
          <button type="button" onClick={onToggleDisabled} disabled={updating}>
            {product.status === "archived"
              ? "Restore"
              : product.status === "disabled"
                ? "Enable"
                : "Disable"}
          </button>
          <button
            className="danger"
            type="button"
            onClick={onArchive}
            disabled={updating || product.status === "archived"}
          >
            Archive
          </button>
          <button
            className="danger"
            type="button"
            onClick={onDelete}
            disabled={updating || product.status !== "archived"}
            title={
              product.status === "archived"
                ? "Permanently delete product"
                : "Archive before deleting"
            }
          >
            Delete
          </button>
        </div>
      </article>
    </div>
  );
}

function StockEditor({
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
  onSaved: (variants: ProductVariant[]) => void;
}) {
  const [variants, setVariants] = useState<ProductVariant[]>(
    product.variants || [],
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const total = variants.reduce(
    (sum, variant) => sum + variant.stock_on_hand,
    0,
  );

  function setStock(id: string, value: number) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id
          ? {
              ...variant,
              stock_on_hand: Math.max(
                variant.reserved,
                Math.round(Number.isFinite(value) ? value : 0),
              ),
            }
          : variant,
      ),
    );
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!variants.length) return;
    setSaving(true);
    setMessage("");

    if (!configured) {
      onSaved(variants);
      return;
    }

    try {
      const response = await fetch("/api/shop/admin/inventory", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          variants: variants.map((variant) => ({
            id: variant.id,
            stock_on_hand: variant.stock_on_hand,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Stock could not be saved.");
      }
      onSaved(result.variants as ProductVariant[]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Stock could not be saved.",
      );
      setSaving(false);
    }
  }

  return (
    <>
      <button className="editor-scrim" type="button" onClick={onClose} />
      <aside className="product-editor stock-editor">
        <header>
          <div>
            <span className="section-label">Inventory / Manual control</span>
            <h2>{product.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close stock editor">
            ×
          </button>
        </header>
        <form onSubmit={save}>
          <div className="stock-editor-summary">
            <span>Total on hand</span>
            <strong>{total}</strong>
            <small>
              Reserved items cannot be removed until their checkout hold ends.
            </small>
          </div>
          {variants.length ? (
            <div className="stock-variant-list">
              {variants.map((variant) => (
                <div className="stock-variant-row" key={variant.id}>
                  <div>
                    <strong>{variant.size}</strong>
                    <span>{variant.color}</span>
                    <small>
                      {variant.reserved} reserved ·{" "}
                      {variant.stock_on_hand - variant.reserved} available
                    </small>
                  </div>
                  <div className="stock-stepper">
                    <button
                      type="button"
                      aria-label={`Decrease ${variant.size} ${variant.color} stock`}
                      onClick={() =>
                        setStock(variant.id, variant.stock_on_hand - 1)
                      }
                    >
                      −
                    </button>
                    <input
                      aria-label={`${variant.size} ${variant.color} stock on hand`}
                      type="number"
                      inputMode="numeric"
                      min={variant.reserved}
                      step="1"
                      value={variant.stock_on_hand}
                      onChange={(event) =>
                        setStock(variant.id, Number(event.target.value))
                      }
                    />
                    <button
                      type="button"
                      aria-label={`Increase ${variant.size} ${variant.color} stock`}
                      onClick={() =>
                        setStock(variant.id, variant.stock_on_hand + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="form-error">
              Add sizes and colors to this product before setting stock.
            </p>
          )}
          {message && <p className="form-error">{message}</p>}
          <button
            className="button button-dark button-wide"
            type="submit"
            disabled={saving || !variants.length}
          >
            {saving ? "Saving…" : "Save stock →"}
          </button>
        </form>
      </aside>
    </>
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
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!configured || !product.id) return;
    fetch(
      `/api/shop/admin/media?productId=${encodeURIComponent(product.id)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then(async (response) => {
        if (response.ok) setGalleryImages(await response.json());
      })
      .catch(() => setMessage("Additional images could not be loaded."));
  }, [configured, product.id, token]);

  function update(field: keyof AdminProduct, value: unknown) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function uploadImage(file?: File) {
    if (!file || !product.id) return;
    setUploading(true);
    setMessage("");
    const form = new FormData();
    form.append("file", file);
    form.append("productId", product.id);

    try {
      const response = await fetch("/api/shop/admin/media", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Image could not be uploaded.");
      }
      setGalleryImages((current) => [...current, result]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Image could not be uploaded.",
      );
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function deleteImage(image: GalleryImage) {
    if (!window.confirm("Remove this additional product image?")) return;
    setMessage("");
    const response = await fetch("/api/shop/admin/media", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ productId: product.id, path: image.path }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Image could not be removed.");
      return;
    }
    setGalleryImages((current) =>
      current.filter((item) => item.path !== image.path),
    );
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
    const response = await fetch("/api/shop/admin/products", {
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
            <img
              src={normalizeShopImageUrl(draft.image_url || draft.image)}
              alt=""
            />
            <span>
              Media uploads activate with Supabase Storage. Existing public
              URLs work now.
            </span>
          </div>
          <div className="editor-gallery">
            <div className="editor-gallery-heading">
              <strong>Additional product images</strong>
              <span>{galleryImages.length} added</span>
            </div>
            <div className="editor-gallery-row">
              {galleryImages.map((image) => (
                <div className="editor-gallery-image" key={image.path}>
                  <img src={image.publicUrl} alt="" />
                  <button
                    type="button"
                    aria-label="Delete additional image"
                    onClick={() => deleteImage(image)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="editor-add-image"
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={!product.id || uploading}
              >
                <span>{uploading ? "…" : "+"}</span>
                <strong>
                  {!product.id
                    ? "Save product first"
                    : uploading
                      ? "Uploading"
                      : "Add more images"}
                </strong>
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => uploadImage(event.target.files?.[0])}
              />
            </div>
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
    image: "/shop/images/unity-heavy-tee.webp",
    image_url: "/shop/images/unity-heavy-tee.webp",
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
