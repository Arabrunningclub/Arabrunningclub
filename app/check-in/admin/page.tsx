import type { Metadata } from "next";
import Layout from "@/components/layout";
import { fetchArcSiteData } from "@/lib/site-data";
import CheckinAdminClient from "./CheckinAdminClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Who’s Here",
  robots: { index: false, follow: false },
};

export default async function CheckinAdminPage() {
  const data = await fetchArcSiteData();
  const events = (data?.events || [])
    .filter((event) => new Date(event.endAt).getTime() > Date.now() - 24 * 60 * 60 * 1000)
    .map((event) => ({
      eventId: event.eventId,
      title: event.title,
      sessions: (data?.sessions || [])
        .filter((session) => session.eventId === event.eventId)
        .map((session) => ({
          sessionId: session.sessionId,
          sessionName: session.sessionName || "Main session",
        })),
    }));

  return (
    <Layout>
      <section className="min-h-screen bg-[#07101f] px-5 pb-20 pt-28">
        <div className="mx-auto max-w-4xl">
          <CheckinAdminClient events={events} />
        </div>
      </section>
    </Layout>
  );
}
