import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key, { apiVersion: "2025-07-30.basil" });
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whSecret) {
    return NextResponse.json(
      { error: "Missing webhook signature/secret" },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const buf = Buffer.from(await req.arrayBuffer()); // byte-accurate body
    const event = stripe.webhooks.constructEvent(buf, sig, whSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const rsvpId =
        session.metadata?.rsvpId ||
        (typeof session.client_reference_id === "string"
          ? session.client_reference_id
          : "");

      if (rsvpId) {
        const appsUrl = process.env.APPS_SCRIPT_WEB_APP_URL; // your /exec URL
        const secret = process.env.APPS_SCRIPT_MARKPAID_SECRET; // must match MARKPAID_SECRET in Apps Script

        if (!appsUrl || !secret) {
          throw new Error(
            "Missing APPS_SCRIPT_WEB_APP_URL or APPS_SCRIPT_MARKPAID_SECRET"
          );
        }

        const resp = await fetch(appsUrl, {
          method: "POST",
          // Keep as text/plain to avoid Apps Script weirdness + matches your earlier pattern
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "markPaid",
            secret,
            rsvpId,
            stripeSessionId: session.id,
          }),
        });

        const out = await resp.json().catch(() => ({} as any));
        if (!out?.ok) {
          console.error("Apps Script markPaid failed:", out);
          // Throwing makes Stripe retry the webhook later (good)
          throw new Error("markPaid failed");
        }

        console.log("✅ Marked PAID in sheet", { rsvpId, sessionId: session.id });
      } else {
        console.warn("⚠️ No rsvpId on session; cannot mark paid");
      }
    }

    // Always acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("Webhook error:", err?.message || err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
