import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Layout from "@/components/layout";
import { fetchArcSiteData } from "@/lib/site-data";
import EventDetailClient from "./EventDetailClient";

export const revalidate = 60;

type PageProps = { params: { slug: string } };

async function getEventData(slug: string) {
  const data = await fetchArcSiteData();
  if (!data) return null;
  const decoded = decodeURIComponent(slug);
  const event = data.events.find(
    (item) => item.slug === decoded || item.eventId === decoded
  );
  if (!event) return null;
  return {
    event,
    theme: (data.eventThemes || []).find((item) => item.eventId === event.eventId) || null,
    sessions: data.sessions.filter((item) => item.eventId === event.eventId),
    media: data.media.filter((item) => item.eventId === event.eventId),
    fields: data.registrationFields.filter(
      (item) => item.eventId === "ALL" || item.eventId === event.eventId
    ),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getEventData(params.slug);
  if (!result) return { title: "Event" };
  const { event } = result;
  return {
    title: event.title,
    description: event.cardDescription || event.fullDescription,
    openGraph: {
      title: event.title,
      description: event.cardDescription || event.fullDescription,
      images: event.socialImageUrl || event.heroImageUrl ? [event.socialImageUrl || event.heroImageUrl] : [],
      type: "website",
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const result = await getEventData(params.slug);
  if (!result) notFound();

  return (
    <Layout>
      <EventDetailClient {...result} />
    </Layout>
  );
}
