"use client";

import { Fragment, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import Layout from "@/components/layout";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronDown, ChevronRight, Instagram, MapPin, X } from "lucide-react";
import { useSiteData } from "@/hooks/use-site-data";
import {
  eventPath,
  formatDisplayCost,
  resolveEventTheme,
  type ArcEvent,
  type ArcEventTheme,
  type ArcMedia,
} from "@/lib/site-data";

type EventSlot = {
  id: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  description: string;
  href: string;
  badge?: string;
  cost?: string;
  images: string[];
  startAt: string;
  endAt: string;
  galleryId?: string;
  theme: ArcEventTheme;
};

const FALLBACK_EVENTS: EventSlot[] = [
  {
    id: "pilates-2026",
    title: "Galentine’s Pilates @ Wayne State",
    dateLabel: "Sat, Feb 21, 2026",
    timeLabel: "11:30 AM – 2:00 PM",
    startAt: "2026-02-21T11:30:00-05:00",
    endAt: "2026-02-21T14:00:00-05:00",
    location: "Student Center · Detroit, MI",
    cost: "$15",
    images: ["/images/pilates-1.jpg", "/images/pilates-2.jpg"],
    description: "Beginner-friendly Pilates with drinks, snacks, and a welcoming community.",
    href: "/events/galentines-pilates-2026",
    badge: "Passed",
    galleryId: "galentines-pilates-2026",
    theme: resolveEventTheme(),
  },
  {
    id: "ice-2026",
    title: "Arabs On Ice",
    dateLabel: "Sat, Jan 10, 2026",
    timeLabel: "6:00 PM – 8:00 PM",
    startAt: "2026-01-10T18:00:00-05:00",
    endAt: "2026-01-10T20:00:00-05:00",
    location: "Campus Martius Rink · Detroit, MI",
    cost: "Varies",
    images: ["/images/iceskating.jpg", "/images/iceskating1.JPG"],
    description: "Ice skating, photos, and community in the heart of Detroit.",
    href: "/events/arabs-on-ice-2026",
    badge: "Passed",
    galleryId: "ice-skating-2026",
    theme: resolveEventTheme(),
  },
  {
    id: "pickleball-2026",
    title: "ARC Pickleball Meetup",
    dateLabel: "Sat, Jun 6, 2026",
    timeLabel: "6:00 PM – 9:00 PM",
    startAt: "2026-06-06T18:00:00-04:00",
    endAt: "2026-06-06T21:00:00-04:00",
    location: "Crowley Park · Dearborn, MI",
    cost: "$5",
    images: ["/images/OUtenniscourts.jpg", "/images/Pickleball.png"],
    description: "An evening of pickleball, movement, and community for every skill level.",
    href: "/events/pickleball-june-2026",
    badge: "Passed",
    galleryId: "june-pickleball-2026",
    theme: resolveEventTheme(),
  },
];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function sheetEventToSlot(
  event: ArcEvent,
  allMedia: ArcMedia[],
  allThemes: ArcEventTheme[]
): EventSlot {
  const start = parseDate(event.startAt);
  const end = parseDate(event.endAt);
  const timeZone = event.timeZone || "America/Detroit";
  const dateLabel = start
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone,
      }).format(start)
    : "Date to be announced";
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
  const timeLabel = start && end
    ? `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`
    : "Time to be announced";
  const images = allMedia
    .filter((item) => item.eventId === event.eventId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => item.imageUrl)
    .filter(Boolean);

  return {
    id: event.eventId,
    title: event.title,
    dateLabel,
    timeLabel,
    startAt: event.startAt,
    endAt: event.endAt,
    location: [event.venue, event.cityState].filter(Boolean).join(" · "),
    cost: formatDisplayCost(event.displayCost),
    images: images.length ? images : event.heroImageUrl ? [event.heroImageUrl] : [],
    description: event.cardDescription || event.fullDescription,
    href: eventPath(event),
    badge: event.cancellationStatus || (event.registrationEnabled ? "Open" : "Closed"),
    galleryId: event.galleryId || undefined,
    theme: resolveEventTheme(allThemes.find((item) => item.eventId === event.eventId)),
  };
}

function eventThemeStyle(theme: ArcEventTheme) {
  return {
    "--card-bg-light": theme.lightCardBackground,
    "--card-text-light": theme.lightCardText,
    "--card-border-light": theme.lightCardBorder,
    "--card-bg-dark": theme.darkCardBackground,
    "--card-text-dark": theme.darkCardText,
    "--card-border-dark": theme.darkCardBorder,
    "--preview-bg-light": theme.lightPreviewBackground,
    "--preview-text-light": theme.lightPreviewText,
    "--preview-bg-dark": theme.darkPreviewBackground,
    "--preview-text-dark": theme.darkPreviewText,
    "--accent": theme.accentColor,
    "--button-bg": theme.buttonBackground,
    "--button-text": theme.buttonText,
  } as CSSProperties;
}

function EventCard({
  event,
  selected,
  isPast,
  onSelect,
}: {
  event: EventSlot;
  selected: boolean;
  isPast: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.article
      layout
      style={eventThemeStyle(event.theme)}
      className={classNames(
        "group flex h-full flex-col overflow-hidden rounded-2xl border bg-[var(--card-bg-light)] text-[var(--card-text-light)] shadow-sm transition",
        "border-[var(--card-border-light)] dark:border-[var(--card-border-dark)] dark:bg-[var(--card-bg-dark)] dark:text-[var(--card-text-dark)]",
        selected && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-white dark:ring-offset-black"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-expanded={selected}
        className="flex flex-1 flex-col p-5 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-55">
              {isPast ? "Past event" : "Upcoming event"}
            </p>
            <h3 className="mt-2 text-xl font-bold leading-tight">{event.title}</h3>
          </div>
          <span className="rounded-full border border-current/15 px-3 py-1 text-xs font-bold opacity-75">
            {isPast ? "Passed" : event.badge || "Open"}
          </span>
        </div>

        <div className="mt-5 space-y-2 text-sm opacity-80">
          <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{event.dateLabel} · {event.timeLabel}</p>
          {event.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.location}</p>}
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 opacity-75">{event.description}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <span className="text-xl font-black">{event.cost}</span>
          <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: event.theme.accentColor }}>
            {selected ? "Hide preview" : "Preview"}<ChevronRight className={classNames("h-4 w-4 transition", selected && "rotate-90")} />
          </span>
        </div>
      </button>

      <div className="flex flex-wrap gap-2 border-t border-current/10 px-5 py-4">
        <Link
          href={event.href}
          className="rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-110"
          style={{ backgroundColor: event.theme.buttonBackground, color: event.theme.buttonText }}
        >
          {isPast ? "View event page" : "Details / RSVP"} →
        </Link>
        {event.galleryId && isPast && (
          <Link href={`/gallery#${event.galleryId}`} className="rounded-full border border-current/20 px-4 py-2 text-sm font-bold">
            Gallery
          </Link>
        )}
      </div>
    </motion.article>
  );
}

function EventPreview({ event, onClose }: { event: EventSlot; onClose: () => void }) {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => setImageIndex(0), [event.id]);

  return (
    <motion.aside
      key={event.id}
      initial={{ opacity: 0, y: 18, x: 12 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 12, x: 12 }}
      transition={{ duration: 0.22 }}
      style={eventThemeStyle(event.theme)}
      className="overflow-hidden rounded-3xl border border-black/10 bg-[var(--preview-bg-light)] text-[var(--preview-text-light)] shadow-xl dark:border-white/10 dark:bg-[var(--preview-bg-dark)] dark:text-[var(--preview-text-dark)] lg:sticky lg:top-24"
    >
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-55">Event preview</p>
          <h2 className="mt-1 text-2xl font-black">{event.title}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close event preview" className="rounded-full border border-current/15 p-2 transition hover:bg-black/5 dark:hover:bg-white/10">
          <X className="h-5 w-5" />
        </button>
      </div>

      {event.images.length > 0 && (
        <div className="px-5">
          <div className="relative overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5">
            <img src={event.images[imageIndex]} alt={event.title} className="aspect-[4/3] w-full object-cover" />
            <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
              {imageIndex + 1}/{event.images.length}
            </span>
          </div>
          {event.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {event.images.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  className={classNames("shrink-0 overflow-hidden rounded-xl border-2", index === imageIndex ? "border-[var(--accent)]" : "border-transparent opacity-60")}
                  aria-label={`Show photo ${index + 1}`}
                >
                  <img src={src} alt="" className="h-16 w-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 p-5">
        <p className="leading-7 opacity-80">{event.description}</p>
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="rounded-xl border border-current/10 p-3"><strong className="block">When</strong><span className="opacity-70">{event.dateLabel}<br />{event.timeLabel}</span></div>
          <div className="rounded-xl border border-current/10 p-3"><strong className="block">Where</strong><span className="opacity-70">{event.location || "Coming soon"}</span></div>
        </div>
        <Link href={event.href} className="flex w-full items-center justify-center rounded-xl px-5 py-3 font-bold transition hover:brightness-110" style={{ backgroundColor: event.theme.buttonBackground, color: event.theme.buttonText }}>
          Open full event page →
        </Link>
      </div>
    </motion.aside>
  );
}

function FloatingInstagram() {
  return (
    <a
      href="https://www.instagram.com/arabrec.club/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="ARC on Instagram"
      className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-2xl border border-black/10 bg-white/75 text-black shadow-lg backdrop-blur-md transition hover:scale-105 dark:border-white/10 dark:bg-black/75 dark:text-white"
    >
      <Instagram className="h-5 w-5" />
    </a>
  );
}

export default function EventsPage() {
  const siteData = useSiteData();
  const [now] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pastOpen, setPastOpen] = useState(true);
  const events = useMemo(
    () => siteData?.events?.length
      ? siteData.events.map((event) => sheetEventToSlot(event, siteData.media || [], siteData.eventThemes || []))
      : FALLBACK_EVENTS,
    [siteData]
  );

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const dated = events.map((event) => ({ event, start: parseDate(event.startAt), end: parseDate(event.endAt) }));
    return {
      upcomingEvents: dated.filter((item) => item.end && item.end >= now).sort((a, b) => +(a.start || 0) - +(b.start || 0)).map((item) => item.event),
      pastEvents: dated.filter((item) => item.end && item.end < now).sort((a, b) => +(b.start || 0) - +(a.start || 0)).map((item) => item.event),
    };
  }, [events, now]);

  const allEvents = useMemo(() => [...upcomingEvents, ...pastEvents], [upcomingEvents, pastEvents]);
  const selectedEvent = selectedId ? allEvents.find((event) => event.id === selectedId) || null : null;

  useEffect(() => {
    if (selectedId && !allEvents.some((event) => event.id === selectedId)) setSelectedId(null);
  }, [allEvents, selectedId]);

  const cardGrid = classNames(
    "grid gap-4 sm:grid-cols-2",
    selectedEvent ? "lg:grid-cols-1 xl:grid-cols-2" : "xl:grid-cols-3"
  );

  return (
    <Layout>
      <FloatingInstagram />
      <main className="min-h-screen bg-white pt-20 text-black transition-colors dark:bg-black dark:text-white">
        <section className="border-b border-black/10 py-12 dark:border-white/10 md:py-16">
          <div className="container mx-auto px-4">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-50">Arab Recreational Club</p>
            <h1 className="mt-2 text-5xl font-black tracking-tight md:text-7xl">Events</h1>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-2xl text-lg opacity-70 md:text-xl">Choose an event to reveal its photos and preview. Your list stays clean until you do.</p>
              <Link href="https://www.instagram.com/arabrec.club/" target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4">Follow Instagram</Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className={classNames("grid items-start gap-8", selectedEvent && "lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]")}>
            <div className="min-w-0 space-y-12">
              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] opacity-50">Happening next</p><h2 className="mt-1 text-3xl font-black">Upcoming</h2></div>
                  <span className="text-sm opacity-55">{upcomingEvents.length} {upcomingEvents.length === 1 ? "event" : "events"}</span>
                </div>
                {upcomingEvents.length ? (
                  <div className={cardGrid}>
                    {upcomingEvents.map((event) => (
                      <Fragment key={event.id}>
                        <EventCard event={event} isPast={false} selected={selectedId === event.id} onSelect={() => setSelectedId(selectedId === event.id ? null : event.id)} />
                        {selectedId === event.id && (
                          <div className="sm:col-span-2 lg:hidden">
                            <EventPreview event={event} onClose={() => setSelectedId(null)} />
                          </div>
                        )}
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-black/10 p-8 text-center dark:border-white/10"><p className="text-lg font-bold">No upcoming events yet.</p><p className="mt-2 opacity-65">New dates will appear here when they are published.</p></div>
                )}
              </section>

              <section>
                <button type="button" onClick={() => setPastOpen((value) => !value)} className="mb-5 flex w-full items-end justify-between gap-4 text-left" aria-expanded={pastOpen}>
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] opacity-50">Archive</p><h2 className="mt-1 flex items-center gap-2 text-3xl font-black">Past events <ChevronDown className={classNames("h-6 w-6 transition", !pastOpen && "-rotate-90")} /></h2></div>
                  <span className="text-sm opacity-55">{pastEvents.length} {pastEvents.length === 1 ? "event" : "events"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {pastOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className={cardGrid}>
                        {pastEvents.map((event) => (
                          <Fragment key={event.id}>
                            <EventCard event={event} isPast selected={selectedId === event.id} onSelect={() => setSelectedId(selectedId === event.id ? null : event.id)} />
                            {selectedId === event.id && (
                              <div className="sm:col-span-2 lg:hidden">
                                <EventPreview event={event} onClose={() => setSelectedId(null)} />
                              </div>
                            )}
                          </Fragment>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            <div className="hidden lg:block">
              <AnimatePresence mode="wait">
                {selectedEvent && <EventPreview event={selectedEvent} onClose={() => setSelectedId(null)} />}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
