import { NextRequest, NextResponse } from "next/server";
import { verifyCheckinToken } from "@/lib/checkin";
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
    const payload = verifyCheckinToken(input.token);
    const response = await fetch(appsUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "check_in",
        secret,
        rsvpId: payload.rsvpId,
        eventId: payload.eventId,
        sessionId: payload.sessionId,
      }),
      cache: "no-store",
      redirect: "follow",
    });
    const result = await response.json().catch(() => ({
      ok: false,
      error: "Invalid check-in response",
    }));
    return NextResponse.json(result, {
      status: response.ok && result?.ok ? 200 : 400,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to check in",
      },
      { status: 400 }
    );
  }
}
