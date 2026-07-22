import { NextRequest, NextResponse } from "next/server";
import { getAppsScriptUrl } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId")?.trim();
  const baseUrl = getAppsScriptUrl();
  if (!eventId) return NextResponse.json({ ok: false, error: "Missing eventId" }, { status: 400 });
  if (!baseUrl) return NextResponse.json({ ok: false, error: "Google Sheets is not configured" }, { status: 503 });

  try {
    const response = await fetch(
      `${baseUrl}?action=availability&eventId=${encodeURIComponent(eventId)}`,
      { cache: "no-store", redirect: "follow" }
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.ok && data?.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false, error: "Availability is temporarily unavailable" }, { status: 502 });
  }
}

