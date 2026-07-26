"use client";

import { useState } from "react";
import { Logo } from "./Logo";

export function ShopComingSoon() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function unlock(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/shop/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "The shop could not be unlocked.");
      setLoading(false);
      return;
    }

    window.location.assign("/shop/admin");
  }

  return (
    <main className="shop-coming-soon">
      <div className="coming-soon-image" aria-hidden="true" />
      <div className="coming-soon-shade" />
      <section>
        <Logo />
        <p className="section-label">ARC movement apparel / Drop 001</p>
        <h1>
          Coming soon
          <span className="coming-soon-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </h1>
        <p className="coming-soon-copy">
          Designed in Detroit. Built to move together.
        </p>
        <details>
          <summary>Staff preview</summary>
          <form onSubmit={unlock}>
            <label htmlFor="shop-preview-password">Preview password</label>
            <div>
              <input
                id="shop-preview-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Opening…" : "Enter →"}
              </button>
            </div>
            {message && <p role="alert">{message}</p>}
          </form>
        </details>
      </section>
    </main>
  );
}
