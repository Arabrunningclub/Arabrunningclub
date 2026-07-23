import { NextRequest, NextResponse } from "next/server";
import { isValidAdminKey } from "@/lib/checkin";
import { getAppsScriptUrl } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const appsUrl = getAppsScriptUrl();
  const secret =
    process.env.APPS_SCRIPT_WRITE_SECRET ||
    process.env.APPS_SCRIPT_MARKPAID_SECRET;
  if (!appsUrl || !secret) {
    return NextResponse.json({ ok: false, error: "Check-in is not configured" }, { status: 503 });
  }

  try {
    const input = await request.json();
    if (!isValidAdminKey(input.adminKey)) {
      return NextResponse.json({ ok: false, error: "Incorrect staff access key" }, { status: 401 });
    }
    const eventId = String(input.eventId || "").trim();
    const sessionId = String(input.sessionId || "").trim();
    if (!eventId) {
      return NextResponse.json({ ok: false, error: "Choose an event" }, { status: 400 });
    }

    const response = await fetch(appsUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "checkin_list",
        secret,
        eventId,
        sessionId,
      }),
      cache: "no-store",
      redirect: "follow",
    });
    const result = await response.json().catch(() => ({
      ok: false,
      error: "Invalid attendee-list response",
    }));
    return NextResponse.json(result, {
      status: response.ok && result?.ok ? 200 : 400,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to load attendees" },
      { status: 502 }
    );
  }
}
