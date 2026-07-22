import { NextRequest, NextResponse } from "next/server";
import { fetchArcSiteData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

function icsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId")?.trim();
  const sessionId = request.nextUrl.searchParams.get("sessionId")?.trim();
  if (!eventId) {
    return NextResponse.json({ ok: false, error: "Missing eventId" }, { status: 400 });
  }

  const data = await fetchArcSiteData();
  const event = data?.events.find(
    (item) => item.eventId === eventId || item.slug === eventId
  );
  if (!event) {
    return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });
  }
  const session = sessionId
    ? data?.sessions.find(
        (item) => item.sessionId === sessionId && item.eventId === event.eventId
      )
    : undefined;
  const startsAt = session?.startAt || event.startAt;
  const endsAt = session?.endAt || event.endAt;
  const summary = session?.sessionName
    ? `${event.title} — ${session.sessionName}`
    : event.title;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
  const eventUrl = `${siteUrl}/events/${encodeURIComponent(event.slug)}`;
  const location = [event.venue, event.streetAddress, event.cityState]
    .filter(Boolean)
    .join(", ");
  const description = event.fullDescription || event.cardDescription;
  const lastModified = event.lastUpdated || startsAt;
  const sequence = Math.max(0, Math.floor(new Date(lastModified).getTime() / 1000));
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Arab Running Club//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${icsText(session?.sessionId || event.eventId)}@arab-runningclub.com`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `LAST-MODIFIED:${icsDate(lastModified)}`,
    `SEQUENCE:${sequence}`,
    `DTSTART:${icsDate(startsAt)}`,
    `DTEND:${icsDate(endsAt)}`,
    `SUMMARY:${icsText(summary)}`,
    `DESCRIPTION:${icsText(description)}`,
    `LOCATION:${icsText(location)}`,
    `URL:${eventUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new NextResponse(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug || event.eventId}.ics"`,
      "Cache-Control": "public, max-age=60",
    },
  });
}
