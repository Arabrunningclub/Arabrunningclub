import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key, { apiVersion: "2025-07-30.basil" });
}

function getAppsScriptUrl(eventKey: string) {
  if (process.env.APPS_SCRIPT_WEB_APP_URL) {
    return process.env.APPS_SCRIPT_WEB_APP_URL;
  }

  const map: Record<string, string | undefined> = {
    pilates: process.env.APPS_SCRIPT_WEB_APP_URL_PILATES,
    pickleball: process.env.APPS_SCRIPT_WEB_APP_URL_PICKLEBALL,
  };

  return map[eventKey];
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
    const buf = Buffer.from(await req.arrayBuffer());
    const event = stripe.webhooks.constructEvent(buf, sig, whSecret);

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const expired = event.type === "checkout.session.expired";

      if (!expired && session.payment_status !== "paid") {
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const rsvpId =
        session.metadata?.rsvpId ||
        (typeof session.client_reference_id === "string"
          ? session.client_reference_id
          : "");

      const eventKey = String(session.metadata?.eventKey || "").trim();

      if (!rsvpId) {
        console.warn("No rsvpId on session; cannot mark paid");
        return NextResponse.json({ received: true }, { status: 200 });
      }

      if (!eventKey) {
        throw new Error("Missing eventKey in Stripe session metadata");
      }

      const appsUrl = getAppsScriptUrl(eventKey);
      const secret = process.env.APPS_SCRIPT_MARKPAID_SECRET;

      if (!appsUrl || !secret) {
        throw new Error(
          `Missing Apps Script URL or secret for eventKey: ${eventKey}`
        );
      }

      const resp = await fetch(appsUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "payment_update",
          secret,
          rsvpId,
          paymentStatus: expired ? "Expired" : "Paid",
          registrationStatus: expired ? "Canceled" : undefined,
          stripeSessionId: session.id,
          onlyIfCurrentStripeSession: true,
          amountPaid:
            !expired && typeof session.amount_total === "number"
              ? session.amount_total / 100
              : undefined,
        }),
      });

      const out = await resp.json().catch(() => ({} as any));

      if (!out?.ok) {
        console.error("Apps Script payment_update failed:", out);
        throw new Error("payment_update failed");
      }

      console.log(expired ? "Released expired RSVP in sheet" : "Marked paid in sheet", {
        eventKey,
        rsvpId,
        sessionId: session.id,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("Webhook error:", err?.message || err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
