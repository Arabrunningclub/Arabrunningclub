import EventsPageClient from "./EventsPageClient";
import { fetchCachedArcSiteData } from "@/lib/site-data";

export const revalidate = 300;

export default async function EventsPage() {
  const siteData = await fetchCachedArcSiteData();

  return <EventsPageClient initialSiteData={siteData} />;
}
