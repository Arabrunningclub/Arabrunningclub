import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY")
  return new Stripe(key, { apiVersion: "2025-07-30.basil" })
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !whSecret) {
    return NextResponse.json({ error: "Missing webhook signature/secret" }, { status: 400 })
  }

  try {
    const stripe = getStripe()
    const buf = Buffer.from(await req.arrayBuffer()) // byte-accurate body
    const event = stripe.webhooks.constructEvent(buf, sig, whSecret)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      console.log("✅ Donation confirmed", {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        currency: session.currency,
      })
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err: any) {
    console.error("Webhook error:", err?.message || err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }
}
