"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Layout from "@/components/layout";
import { AnimatePresence, motion } from "framer-motion";

type EventSlot = {
  id: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  description: string;

  // For upcoming events
  href: string;
  badge?: string;
  cost?: string;

  // Gallery + sorting
  images?: string[];
  startAt: string; // ISO w/ timezone
  endAt: string; // ISO w/ timezone

  // If you want “View full gallery” to scroll to a section on /gallery
  galleryId?: string; // matches GalleryEvent.id on /gallery
};

const EVENTS: EventSlot[] = [
  {
    id: "pilates",
    title: "Galentine’s Pilates @ Wayne State",
    dateLabel: "Wed • Feb 21, 2026",
    timeLabel: "11:30 AM – 12:30 PM • 1:00 PM – 2:00 PM",
    startAt: "2026-02-21T11:30:00-05:00",
    endAt: "2026-02-21T14:00:00-05:00",
    location: "Student Center • Dance Room 020",
    cost: "$15",
    images: [
      // IMPORTANT: must match EXACT filenames in /public/images (case + extension)
      "/images/pilates-1.jpeg",
      "/images/pilates-2.jpg",
      "/images/pilates-3.jpg",
      "/images/pilates-4.jpg",
      "/images/pilates-5.JPG",
      "/images/pilates-6.JPG",
      "/images/pilates-7.JPG",
      "/images/pilates-8.JPG",
    ],
    description:
      "Beginner-friendly premium pilates experience. Drinks + snacks included. RSVP so we can plan mats, spacing, and the overall setup.",
    href: "/pilates",
    badge: "Open",
    galleryId: "galentines-pilates-2026",
  },
  {
    id: "ice",
    title: "Arabs On Ice",
    dateLabel: "Sat • Jan 10, 2026",
    timeLabel: "6:00 PM – 8:00 PM",
    startAt: "2026-01-10T18:00:00-05:00",
    endAt: "2026-01-10T20:00:00-05:00",
    location: "Campus Martius Rink",
    cost: "Varies",
    images: [
      "/images/iceskating.jpg",
      "/images/iceskating1.JPG",
      "/images/iceskating3.jpg",
      "/images/iceskating4.jpg",
    ],
    description: "Ice skating + photos + vibes.",
    href: "/events",
    badge: "Passed",
    galleryId: "ice-skating-2026",
  },
];

const FALLBACK_IMAGES = [
  "/images/pilates-1.jpeg",
  "/images/pilates-2.jpg",
  "/images/pilates-3.jpg",
  "/images/pilates-4.jpg",
];

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function parseISO(s: string) {
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d : null;
}

function FloatingInstagram() {
  return (
    <motion.a
      href="https://www.instagram.com/arabrec.club/"
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(
        "fixed z-[60] right-4 md:right-6 top-1/2 -translate-y-1/2",
        "rounded-2xl border border-black/10 dark:border-white/10",
        "bg-white/65 dark:bg-white/10 backdrop-blur",
        "shadow-lg hover:shadow-xl transition",
        "p-3 md:p-4"
      )}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      title="Instagram"
    >
      <img
        src="/instagram.svg"
        alt="Instagram"
        className="h-10 w-10 md:h-12 md:w-12"
        draggable={false}
      />
    </motion.a>
  );
}

function Slideshow({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);
  const count = images.length;

  useEffect(() => setIdx(0), [images.join("|")]);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 4200);
    return () => clearInterval(t);
  }, [count]);

  const active = images[idx] ?? images[0];

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider opacity-70">Gallery Preview</p>
          <h3 className="text-base font-semibold truncate">{title}</h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIdx((i) => (i - 1 + count) % count)}
            disabled={count <= 1}
            className={classNames(
              "rounded-full border px-3 py-1 text-sm transition",
              "border-black/10 dark:border-white/15",
              count <= 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            )}
            aria-label="Previous image"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % count)}
            disabled={count <= 1}
            className={classNames(
              "rounded-full border px-3 py-1 text-sm transition",
              "border-black/10 dark:border-white/15",
              count <= 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            )}
            aria-label="Next image"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute left-3 top-3 z-10 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
          {idx + 1}/{count}
        </div>

        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={active}
            alt=""
            className="h-[360px] sm:h-[420px] md:h-[520px] w-full object-cover"
            loading="lazy"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </AnimatePresence>
      </div>

      <div className="mt-3 grid grid-cols-6 gap-2">
        {images.slice(0, 12).map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setIdx(i)}
            className={classNames(
              "overflow-hidden rounded-xl border transition",
              i === idx
                ? "border-black dark:border-white"
                : "border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30"
            )}
            aria-label={`Select image ${i + 1}`}
          >
            <img
              src={src}
              alt=""
              className={classNames(
                "h-14 w-full object-cover transition-transform duration-300",
                i === idx ? "scale-105" : "hover:scale-105"
              )}
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
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
  const galleryHref = event.galleryId ? `/gallery#${event.galleryId}` : "/gallery";

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.16 }} className="h-full">
      <button
        type="button"
        onClick={onSelect}
        className={classNames(
          "w-full text-left rounded-2xl p-5 border transition",
          "shadow-sm hover:shadow-md",
          selected ? "border-black/40 dark:border-white/40" : "border-black/10 dark:border-white/10",
          isPast ? "bg-white/60 dark:bg-white/5" : "bg-pink-500 text-white"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className={classNames("text-xl font-bold leading-snug", isPast && "text-black dark:text-white")}>
              {event.title}
            </h3>
            <p className={classNames("mt-1 text-sm", isPast ? "opacity-80" : "text-white/90")}>
              {event.dateLabel}
            </p>
            <p className={classNames("text-sm", isPast ? "opacity-80" : "text-white/90")}>{event.timeLabel}</p>
            <p className={classNames("mt-2 text-sm", isPast ? "opacity-80" : "text-white/90")}>{event.location}</p>
          </div>

          <div className="shrink-0 text-right">
            <span
              className={classNames(
                "inline-block rounded-full px-3 py-1 text-xs font-semibold",
                isPast ? "bg-black/5 dark:bg-white/10" : "bg-white/15"
              )}
            >
              {isPast ? "Passed" : event.badge ?? "Open"}
            </span>

            {event.cost ? (
              <div className={classNames("mt-2 text-xl font-semibold leading-tight", isPast && "text-black dark:text-white")}>
                {event.cost}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <p className={classNames("text-sm", isPast ? "opacity-80" : "text-white/95")}>{event.description}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {!isPast ? (
            <Link
              href={event.href}
              onClick={(e) => e.stopPropagation()}
              className={classNames(
                "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border transition",
                "bg-white text-black border-white/30 hover:bg-black hover:text-white hover:border-black",
                "dark:bg-black dark:text-white dark:border-white/30 dark:hover:bg-white dark:hover:text-black"
              )}
            >
              View details / RSVP →
            </Link>
          ) : (
            <Link
              href={galleryHref}
              onClick={(e) => e.stopPropagation()}
              className={classNames(
                "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border transition",
                "border-black/15 dark:border-white/15 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              )}
            >
              View full gallery
            </Link>
          )}

          <span
            className={classNames(
              "inline-flex items-center rounded-full px-3 py-2 text-xs border opacity-80",
              selected ? "border-black/30 dark:border-white/30" : "border-black/10 dark:border-white/10"
            )}
          >
            Click card to preview gallery
          </span>
        </div>
      </button>
    </motion.div>
  );
}

export default function EventsPage() {
  const now = new Date();

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const withDates = EVENTS.map((e) => ({
      e,
      start: parseISO(e.startAt),
      end: parseISO(e.endAt),
    })).filter((x) => x.start && x.end) as Array<{ e: EventSlot; start: Date; end: Date }>;

    const upcoming = withDates
      .filter((x) => x.end >= now) // stays visible until end
      .sort((a, b) => +a.start - +b.start)
      .map((x) => x.e);

    const past = withDates
      .filter((x) => x.end < now)
      .sort((a, b) => +b.start - +a.start)
      .map((x) => x.e);

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [now.getTime()]);

  const [pastOpen, setPastOpen] = useState(true);

  const initialSelected = upcomingEvents[0]?.id ?? pastEvents[0]?.id ?? EVENTS[0]?.id ?? "pilates";
  const [selectedId, setSelectedId] = useState<string>(initialSelected);

  // Keep selectedId valid (does NOT depend on pastOpen)
  useEffect(() => {
    const all = [...upcomingEvents, ...pastEvents];
    if (!all.find((e) => e.id === selectedId)) setSelectedId(all[0]?.id ?? initialSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingEvents.length, pastEvents.length]);

  const allEvents = useMemo(() => [...upcomingEvents, ...pastEvents], [upcomingEvents, pastEvents]);

  const selectedEvent =
    allEvents.find((e) => e.id === selectedId) ?? upcomingEvents[0] ?? pastEvents[0] ?? EVENTS[0];

  const galleryImages =
    selectedEvent?.images && selectedEvent.images.length > 0 ? selectedEvent.images : FALLBACK_IMAGES;

  return (
    <Layout>
      <FloatingInstagram />

      <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors">
        {/* extra top padding so navbar doesn’t cut the title */}
        <section className="pt-24 md:pt-28 pb-10">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold">Events</h1>
            <p className="mt-3 text-lg md:text-2xl opacity-90">
              Upcoming events first — past events stay for galleries + credibility.
            </p>
            <p className="mt-3 text-sm opacity-70">
              Don’t see an event yet? Follow{" "}
              <Link
                href="https://www.instagram.com/arabrec.club/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                Instagram
              </Link>{" "}
              for updates.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto px-4">
            {/* Responsive: slideshow visible on split-screen (right column on md+) */}
            <div className="grid gap-10 md:grid-cols-[1fr_420px] lg:grid-cols-[1fr_520px] items-start">
              <div className="md:order-2">
                <div className="md:sticky md:top-24">
                  <Slideshow images={galleryImages} title={selectedEvent?.title ?? "Gallery"} />
                </div>
              </div>

              <div className="md:order-1">
                {/* Upcoming */}
                <div className="mb-10">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-bold">Upcoming</h2>
                    <span className="text-sm opacity-70">
                      {upcomingEvents.length} {upcomingEvents.length === 1 ? "event" : "events"}
                    </span>
                  </div>

                  {upcomingEvents.length === 0 ? (
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 p-8 text-center">
                      <p className="text-lg font-semibold">No upcoming events.</p>
                      <p className="mt-2 opacity-75">Check back soon — new slots will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {upcomingEvents.map((e) => (
                        <EventCard
                          key={e.id}
                          event={e}
                          isPast={false}
                          selected={selectedId === e.id}
                          onSelect={() => setSelectedId(e.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Past (arrow toggle + collapse animation) */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setPastOpen((v) => !v)}
                    className="group inline-flex items-center gap-2"
                    aria-expanded={pastOpen}
                    aria-controls="past-events"
                  >
                    <h2 className="text-2xl font-bold">Past</h2>

                    <motion.span
                      animate={{ rotate: pastOpen ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 dark:border-white/10
                                 opacity-80 group-hover:opacity-100 transition"
                      title={pastOpen ? "Collapse past events" : "Expand past events"}
                    >
                      <span className="text-sm">›</span>
                    </motion.span>
                  </button>

                  <span className="text-sm opacity-70">
                    {pastEvents.length} {pastEvents.length === 1 ? "event" : "events"}
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {pastOpen && (
                    <motion.div
                      id="past-events"
                      key="past-events"
                      initial={{ height: 0, opacity: 0, y: -10 }}
                      animate={{ height: "auto", opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -10 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {pastEvents.length === 0 ? (
                        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-8 text-center">
                          <p className="opacity-75">No past events listed yet.</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {pastEvents.map((e) => (
                            <EventCard
                              key={e.id}
                              event={e}
                              isPast={true}
                              selected={selectedId === e.id}
                              onSelect={() => setSelectedId(e.id)}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}