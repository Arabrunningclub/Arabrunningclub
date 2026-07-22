import { NextRequest, NextResponse } from "next/server";
import { getAppsScriptUrl } from "@/lib/site-data";

export const dynamic = "force-dynamic";

const allowedPaymentMethods = new Set(["Card", "Zelle", "Cash", "In person", "None"]);

export async function POST(request: NextRequest) {
  const baseUrl = getAppsScriptUrl();
  const secret = process.env.APPS_SCRIPT_WRITE_SECRET || process.env.APPS_SCRIPT_MARKPAID_SECRET;
  if (!baseUrl || !secret) {
    return NextResponse.json({ ok: false, error: "Registration is not configured" }, { status: 503 });
  }

  try {
    const input = await request.json();
    const eventId = String(input.eventId || "").trim();
    const sessionId = String(input.sessionId || "").trim();
    const fullName = String(input.fullName || "").trim().slice(0, 120);
    const email = String(input.email || "").trim().toLowerCase().slice(0, 200);
    const phone = String(input.phone || "").trim().slice(0, 40);
    const paymentMethod = allowedPaymentMethods.has(String(input.paymentMethod))
      ? String(input.paymentMethod)
      : "None";

    if (!eventId || !sessionId || !fullName || !email) {
      return NextResponse.json({ ok: false, error: "Please complete all required fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email" }, { status: 400 });
    }

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "rsvp", secret, eventId, sessionId, fullName, email, phone, paymentMethod }),
      cache: "no-store",
      redirect: "follow",
    });
    const data = await response.json().catch(() => ({ ok: false, error: "Invalid registration response" }));
    return NextResponse.json(data, { status: response.ok && data?.ok ? 200 : 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "Registration is temporarily unavailable" }, { status: 502 });
  }
}
