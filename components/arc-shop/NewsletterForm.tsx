"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    const response = await fetch("/api/shop/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(response.ok ? "success" : "error");
    if (response.ok) setEmail("");
  }

  return (
    <form className="newsletter" onSubmit={submit}>
      <span className="footer-label">Field notes / early access</span>
      <h3>Enter the movement.</h3>
      <label>
        <span className="sr-only">Email address</span>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button type="submit" aria-label="Join newsletter" disabled={status === "loading"}>
          {status === "loading" ? "…" : "→"}
        </button>
      </label>
      {status === "success" && <p className="newsletter-status">You’re in. Field notes are on the way.</p>}
      {status === "error" && <p className="newsletter-status error">That didn’t land. Try again.</p>}
    </form>
  );
}
