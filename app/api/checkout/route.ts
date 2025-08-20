// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs"; // ensure Node runtime

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string); // no apiVersion pin

export async function POST(req: Request) {
  try {
    const { amount } = await req.json(); // "25" or 25
    const dollars =
      typeof amount === "string" ? parseFloat(amount) : Number(amount);
    if (!dollars || isNaN(dollars) || dollars <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    const cents = Math.round(dollars * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"], // ✅ valid for Checkout
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Donation" },
            unit_amount: cents, // ✅ use cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donations?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donations?status=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Stripe error" },
      { status: 500 }
    );
  }
}

