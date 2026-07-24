"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "./StoreProvider";

const links = [
  ["New drop", "/shop/products"],
  ["Run", "/shop/products?collection=run"],
  ["Off-duty", "/shop/products?collection=off-duty"],
  ["Objects", "/shop/products?collection=objects"],
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, setDrawerOpen } = useCart();

  return (
    <>
      <div className="announcement">
        <span>Detroit movement system / Drop 001</span>
        <span>Free shipping over $100 · Easy returns</span>
      </div>
      <header className="site-header">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => (
            <Link href={href} key={label}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="text-action desktop-only" href="/shop/products">
            Search
          </Link>
          <Link className="text-action desktop-only" href="/shop/admin">
            Account
          </Link>
          <button
            className="bag-button"
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={`Open shopping bag with ${count} items`}
          >
            Bag <span>{count}</span>
          </button>
          <button
            className="menu-button"
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <i />
            <i />
          </button>
        </div>
      </header>
      <div className={`mobile-menu ${menuOpen ? "is-open" : ""}`}>
        <div className="mobile-menu-number">ARC / 001</div>
        {links.map(([label, href], index) => (
          <Link href={href} key={label} onClick={() => setMenuOpen(false)}>
            <span>0{index + 1}</span>
            {label}
          </Link>
        ))}
        <div className="mobile-menu-foot">
          <Link href="/shop/admin" onClick={() => setMenuOpen(false)}>
            Account
          </Link>
          <span>Move together.</span>
        </div>
      </div>
    </>
  );
}
