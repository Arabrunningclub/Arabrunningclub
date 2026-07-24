import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseServiceFetch } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return Response.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const payload = await request.text();
  if (!verifyStripeSignature(payload, signature, secret)) {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    id: string;
    type: string;
    data: {
      object: {
        id: string;
        metadata?: { order_id?: string };
        customer_details?: { email?: string };
        payment_intent?: string;
      };
    };
  };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      const response = await supabaseServiceFetch(
        "/rest/v1/rpc/mark_shop_order_paid",
        {
          method: "POST",
          body: JSON.stringify({
            p_order_id: orderId,
            p_stripe_event_id: event.id,
            p_stripe_session_id: session.id,
            p_payment_intent_id: session.payment_intent || null,
            p_customer_email: session.customer_details?.email || null,
          }),
        },
      );
      if (!response.ok) {
        return Response.json({ error: await response.text() }, { status: 500 });
      }
    }
  }

  return Response.json({ received: true });
}

function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
) {
  const values = Object.fromEntries(
    header.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );
  if (!values.t || !values.v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(values.t)) > 300) return false;
  const expected = createHmac("sha256", secret)
    .update(`${values.t}.${payload}`, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(values.v1);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}
