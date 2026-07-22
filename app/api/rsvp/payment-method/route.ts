import { NextRequest, NextResponse } from "next/server";
import { fetchArcSiteData, getAppsScriptUrl } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const baseUrl = getAppsScriptUrl();
  const secret = process.env.APPS_SCRIPT_WRITE_SECRET || process.env.APPS_SCRIPT_MARKPAID_SECRET;
  if (!baseUrl || !secret) {
    return NextResponse.json({ ok: false, error: "Registration is not configured" }, { status: 503 });
  }

  try {
    const input = await request.json();
    const rsvpId = String(input.rsvpId || "").trim();
    const eventId = String(input.eventId || "").trim();
    const sessionId = String(input.sessionId || "").trim();
    const paymentMethod = String(input.paymentMethod || "").trim();
    const siteData = await fetchArcSiteData();
    const session = siteData?.sessions.find(
      (item) => item.eventId === eventId && item.sessionId === sessionId
    );

    if (!rsvpId || !session) {
      return NextResponse.json({ ok: false, error: "Registration session not found" }, { status: 404 });
    }
    if (paymentMethod === "Card" || !session.paymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ ok: false, error: "That payment method is not available" }, { status: 400 });
    }

    const amountDue = paymentMethod === "None" ? 0 : Number(session.payLaterPrice) || 0;
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "payment_update",
        secret,
        rsvpId,
        paymentMethod,
        paymentStatus: amountDue > 0 ? "Pending" : "Not Required",
        amountDue,
        stripeSessionId: "",
        clearPaymentDeadline: true,
      }),
      cache: "no-store",
      redirect: "follow",
    });
    const data = await response.json().catch(() => ({ ok: false, error: "Invalid registration response" }));
    const updated = data?.ok && data?.paymentMethod === paymentMethod;
    return NextResponse.json(
      updated
        ? { ok: true, rsvpId, paymentMethod, amountDue }
        : { ok: false, error: data?.error || "Payment switching needs the latest registration service update" },
      { status: response.ok && updated ? 200 : 409 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to change the payment method" }, { status: 502 });
  }
}
