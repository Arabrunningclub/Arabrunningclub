// app/api/checkout/route.ts
import { NextResponse, type NextRequest } from "next/server"
import Stripe from "stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY")
  // Fixed api_Version to apiVersion (camelCase)
  return new Stripe(key, { apiVersion: "2025-07-30.basil" })
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const { amount } = await req.json()
    const dollars = typeof amount === "string" ? Number.parseFloat(amount) : Number(amount)
    if (!Number.isFinite(dollars) || dollars <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    const cents = Math.max(50, Math.round(dollars * 100))

    const proto = req.headers.get("x-forwarded-proto") ?? "https"
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host")
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? `${proto}://${host}`

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Donation" },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${base}/donations?status=success`,
      cancel_url: `${base}/donations?status=cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Stripe error" }, { status: 500 })
  }
}
