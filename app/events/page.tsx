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
      "/images/pilates-1.jpg",
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

type AmbientParticle = {
  id: number;
  left: string;
  top: string;
  size: number;
  blur: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  color: "gray" | "red";
};

function AmbientAtmosphere() {
  const particles = useMemo<AmbientParticle[]>(() => {
    // deterministic-ish spread (no flicker across renders)
    return Array.from({ length: 24 }, (_, i) => {
      const t = i + 1;
      const gray = i % 3 !== 0;
      return {
        id: i,
        left: `${(t * 37) % 100}%`,
        top: `${8 + ((t * 19) % 78)}%`,
        size: 2 + ((t * 7) % 7), // 2..8px
        blur: i % 4 === 0 ? 2 : i % 4 === 1 ? 4 : 6,
        opacity: gray ? 0.16 + (i % 5) * 0.03 : 0.12 + (i % 4) * 0.03,
        duration: 11 + (i % 7) * 2.4,
        delay: (i % 5) * 0.7,
        driftX: -14 + ((t * 11) % 28), // -14..14
        driftY: -10 + ((t * 13) % 20), // -10..10
        color: gray ? "gray" : "red",
      };
    });
  }, []);

  return (
    <>
      {/* Base ambient layer across page */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* soft top diffusion / PS5-like calm glow */}
        <motion.div
          aria-hidden
         className="absolute inset-[-20%] blur-3xl"
          style={{
            background: `
              radial-gradient(55% 80% at 50% 0%, rgba(189,196,207,0.5) 0%, rgba(189,196,207,0.12) 34%, rgba(189,196,207,0.04) 58%, rgba(0,0,0,0) 78%),
              radial-gradient(42% 68% at 74% 4%, rgba(134,56,56,1) 0%, rgba(134,56,56,0.10) 36%, rgba(134,56,56,0.03) 60%, rgba(0,0,0,0) 80%),
              radial-gradient(36% 56% at 22% 10%, rgba(128,132,138,0.16) 0%, rgba(128,132,138,0.08) 40%, rgba(0,0,0,0) 76%)
            `,
            
          }}
          animate={{
            opacity: [0.82, 1, 0.9, 0.98, 0.82],
            scale: [1, 1.015, 1.01, 1.02, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* subtle top beam / strip diffusion */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 h-28 md:h-36 blur-2xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(192,198,210,0.14) 0%, rgba(142,70,70,0.10) 35%, rgba(0,0,0,0) 100%)",
          }}
          animate={{ opacity: [0.65, 0.85, 0.7, 0.65] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* very faint lower-page color continuity so it feels integrated while scrolling */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-[16rem] bottom-0 opacity-50 blur-3xl"
          style={{
            background: `
              radial-gradient(35% 30% at 18% 30%, rgba(120,120,120,0.08), rgba(0,0,0,0) 70%),
              radial-gradient(32% 26% at 80% 42%, rgba(130,52,52,0.08), rgba(0,0,0,0) 72%)
            `,
          }}
        />

        {/* floating particles */}
        <div className="absolute inset-0">
          {particles.map((p) => {
            const baseColor =
              p.color === "gray"
                ? "rgba(202,208,214,0.9)"
                : "rgba(142,74,74,0.9)"; // muted/matte red

            return (
              <motion.span
                key={p.id}
                aria-hidden
                className="absolute rounded-full"
                style={{
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size,
                  opacity: p.opacity,
                  filter: `blur(${p.blur}px)`,
                  background: baseColor,
                  boxShadow:
                    p.color === "gray"
                      ? "0 0 18px rgba(200,205,212,0.18)"
                      : "0 0 18px rgba(145,72,72,0.14)",
                }}
                animate={{
                  x: [0, p.driftX, p.driftX * 0.45, 0],
                  y: [0, p.driftY, p.driftY * -0.35, 0],
                  opacity: [
                    p.opacity * 0.7,
                    p.opacity,
                    p.opacity * 0.75,
                    p.opacity * 0.9,
                    p.opacity * 0.7,
                  ],
                  scale: [1, 1.2, 0.95, 1.05, 1],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>

        {/* ultra subtle vignette to keep focus on content */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 dark:to-black/20" />
      </div>
    </>
  );
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

      <main className="relative isolate min-h-screen overflow-x-clip bg-white text-black dark:bg-black dark:text-white transition-colors">
        <AmbientAtmosphere />

        {/* content wrapper stays above ambience */}
        <div className="relative z-10">
          {/* extra top padding so navbar doesn’t cut the title */}
          <section className="pt-24 md:pt-28 pb-10">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-bold">Events</h1>
              <p className="mt-3 text-lg md:text-2xl opacity-90">
                Find our latest events here
              </p>
              <p className="mt-3 text-bg opacity-70">
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
        </div>
      </main>
    </Layout>
  );
}