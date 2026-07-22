import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { fetchArcSiteData, getAppsScriptUrl } from "@/lib/site-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const CHECKOUT_EXPIRATION_SECONDS = 30 * 60;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key, { apiVersion: "2025-07-30.basil" });
}

function cleanReturnPath(value: unknown) {
  const fallback = "/pilates";

  if (typeof value !== "string") return fallback;

  const path = value.trim();

  // Allows internal paths like /pickleball or /pilates
  // Blocks full external URLs like https://scam.com
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;

  return path;
}

function cleanEventKeyFrom(value: unknown, eventName: string) {
  if (typeof value === "string") {
    const key = value.trim().toLowerCase().replace(/^\/+/, "");
    if (/^[a-z0-9][a-z0-9-]{0,79}$/.test(key)) return key;
  }

  // fallback if frontend forgets to send eventKey
  if (eventName.toLowerCase().includes("pickleball")) {
    return "pickleball";
  }

  return eventName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "event";
}

async function attachCheckoutToRsvp(rsvpId: string, stripeSessionId: string, expiresAt: number) {
  const appsUrl = getAppsScriptUrl();
  const secret = process.env.APPS_SCRIPT_WRITE_SECRET || process.env.APPS_SCRIPT_MARKPAID_SECRET;
  if (!appsUrl || !secret) throw new Error("Registration payment updates are not configured");

  const response = await fetch(appsUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "payment_update",
      secret,
      rsvpId,
      paymentStatus: "Pending",
      stripeSessionId,
      paymentDeadline: new Date(expiresAt * 1000).toISOString(),
    }),
    cache: "no-store",
    redirect: "follow",
  });
  const result = await response.json().catch(() => ({ ok: false }));
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || "Unable to attach checkout to the registration");
  }
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();

    const { rsvpId, email, returnPath, eventId, sessionId } = await req.json();

    const rid = String(rsvpId || "").trim();

    if (!rid) {
      return NextResponse.json({ error: "Missing rsvpId" }, { status: 400 });
    }

    const cleanEventId = String(eventId || "").trim();
    const cleanSessionId = String(sessionId || "").trim();
    const siteData = await fetchArcSiteData();
    const event = siteData?.events.find((item) => item.eventId === cleanEventId);
    const eventSession = siteData?.sessions.find(
      (item) => item.eventId === cleanEventId && item.sessionId === cleanSessionId
    );

    if (!event || !eventSession) {
      return NextResponse.json({ error: "Event session not found" }, { status: 404 });
    }
    if (!eventSession.paymentMethods.includes("Card")) {
      return NextResponse.json({ error: "Online payment is not enabled for this session" }, { status: 400 });
    }

    const dollars = Number(eventSession.cardPrice);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      return NextResponse.json({ error: "Invalid card price for this session" }, { status: 400 });
    }

    const cleanPath = cleanReturnPath(returnPath);

    const cleanEventName = event.title || "Arab Rec Club Event";
    const cleanEventKey = cleanEventKeyFrom(event.eventId, cleanEventName);

    const cents = Math.max(50, Math.round(dollars * 100));

    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");

    const requestBase = `${proto}://${host}`;
    const configuredBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    const base = process.env.NODE_ENV === "development" ? requestBase : configuredBase || requestBase;

    const expiresAt = Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRATION_SECONDS;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      expires_at: expiresAt,
      client_reference_id: rid,
      metadata: {
        rsvpId: rid,
        eventId: event.eventId,
        sessionId: eventSession.sessionId,
        eventName: cleanEventName,
        returnPath: cleanPath,
        eventKey: cleanEventKey,
      },
      customer_email: typeof email === "string" ? email : undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: cleanEventName,
            },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${base}${cleanPath}?status=success&session_id={CHECKOUT_SESSION_ID}&rsvpId=${encodeURIComponent(rid)}&sessionId=${encodeURIComponent(eventSession.sessionId)}#registration`,
      cancel_url: `${base}${cleanPath}?status=cancel&rsvpId=${encodeURIComponent(rid)}&sessionId=${encodeURIComponent(eventSession.sessionId)}#registration`,
    });

    try {
      await attachCheckoutToRsvp(rid, session.id, expiresAt);
    } catch (error) {
      await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
      throw error;
    }

    return NextResponse.json({ url: session.url, expiresAt: new Date(expiresAt * 1000).toISOString() });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Stripe error" },
      { status: 500 }
    );
  }
}
