"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/arc-shop/catalog";
import { useCart } from "./StoreProvider";

export function AddToBag({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0].name);
  const { addItem } = useCart();

  return (
    <div className="product-form">
      <fieldset>
        <legend>
          Color <span>{color}</span>
        </legend>
        <div className="swatches">
          {product.colors.map((option) => (
            <label key={option.name} title={option.name}>
              <input
                type="radio"
                name="color"
                value={option.name}
                checked={color === option.name}
                onChange={() => setColor(option.name)}
              />
              <span style={{ background: option.hex }} />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>
          Size <Link href="/shop/pages/size-guide">Size guide</Link>
        </legend>
        <div className="sizes">
          {product.sizes.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="size"
                value={option}
                checked={size === option}
                onChange={() => setSize(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        className="button button-dark button-wide product-add"
        type="button"
        onClick={() => addItem(product, size, color)}
      >
        Add to bag <span>→</span>
      </button>
      <div className="product-promises">
        <span>Free shipping over $100</span>
        <span>30-day returns</span>
      </div>
    </div>
  );
}
