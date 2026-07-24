import { products as fallbackProducts } from "@/lib/arc-shop/catalog";
import { getStorefrontProducts } from "@/lib/arc-shop/storefront";
import { getSupabaseConfig, supabaseServiceFetch } from "@/lib/arc-shop/supabase-admin";

type CheckoutItem = {
  productId: string;
  slug: string;
  size: string;
  color: string;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: CheckoutItem[] };
    const items = body.items;
    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
      return Response.json({ error: "Your bag is empty or invalid." }, { status: 400 });
    }
    if (
      items.some(
        (item) =>
          !item.productId ||
          !item.size ||
          !item.color ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 10,
      )
    ) {
      return Response.json({ error: "One or more bag items are invalid." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const stripeKey =
      process.env.ARC_SHOP_STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY;
    const supabase = getSupabaseConfig();
    const catalog = supabase ? await getStorefrontProducts() : fallbackProducts;
    const resolved = items.map((item) => ({
      ...item,
      product: catalog.find((product) => product.id === item.productId),
    }));
    if (resolved.some((item) => !item.product)) {
      return Response.json(
        { error: "A product in your bag is no longer available." },
        { status: 409 },
      );
    }

    if (!stripeKey || !supabase) {
      return Response.json({
        mode: "demo",
        url: `${origin}/shop/checkout/success?demo=1`,
      });
    }

    const reserveResponse = await supabaseServiceFetch(
      "/rest/v1/rpc/reserve_shop_order",
      {
        method: "POST",
        body: JSON.stringify({
          p_items: items.map((item) => ({
            product_id: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
        }),
      },
    );
    const reserved = (await reserveResponse.json()) as
      | { order_id: string; expires_at: string }
      | { message?: string };
    if (!reserveResponse.ok || !("order_id" in reserved)) {
      return Response.json(
        {
          error:
            "message" in reserved
              ? reserved.message
              : "We could not reserve those items.",
        },
        { status: 409 },
      );
    }

    const stripeBody = new URLSearchParams();
    stripeBody.set("mode", "payment");
    stripeBody.set(
      "success_url",
      `${origin}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${reserved.order_id}`,
    );
    stripeBody.set("cancel_url", `${origin}/shop/cart?checkout=cancelled`);
    stripeBody.set("metadata[order_id]", reserved.order_id);
    stripeBody.set("billing_address_collection", "auto");
    stripeBody.set("shipping_address_collection[allowed_countries][0]", "US");
    stripeBody.set("automatic_tax[enabled]", "true");
    stripeBody.set("phone_number_collection[enabled]", "true");

    resolved.forEach((item, index) => {
      const product = item.product!;
      stripeBody.set(
        `line_items[${index}][price_data][currency]`,
        "usd",
      );
      stripeBody.set(
        `line_items[${index}][price_data][unit_amount]`,
        String(product.price * 100),
      );
      stripeBody.set(
        `line_items[${index}][price_data][product_data][name]`,
        product.name,
      );
      stripeBody.set(
        `line_items[${index}][price_data][product_data][description]`,
        `${item.color} / ${item.size}`,
      );
      stripeBody.set(
        `line_items[${index}][quantity]`,
        String(item.quantity),
      );
    });

    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: stripeBody,
      },
    );
    const session = (await stripeResponse.json()) as {
      id?: string;
      url?: string;
      error?: { message?: string };
    };
    if (!stripeResponse.ok || !session.url) {
      await supabaseServiceFetch("/rest/v1/rpc/release_shop_order", {
        method: "POST",
        body: JSON.stringify({ p_order_id: reserved.order_id }),
      });
      return Response.json(
        { error: session.error?.message || "Stripe checkout could not open." },
        { status: 502 },
      );
    }

    await supabaseServiceFetch(
      `/rest/v1/orders?id=eq.${reserved.order_id}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ stripe_checkout_session_id: session.id }),
      },
    );

    return Response.json({ mode: "live", url: session.url });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout could not be created.",
      },
      { status: 500 },
    );
  }
}
