"use client";

import { motion } from "framer-motion";
import Layout from "@/components/layout";
import Link from "next/link";

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
  images?: string[]; // NEW
};

const EVENTS: EventSlot[] = [
  {
    id: "pilates",
    title: "Galentine’s Pilates @ Wayne State",
    dateLabel: "Wed • Feb 11, 2026",
    timeLabel: "11:30 AM – 12:30 PM • 1:00 PM – 2:00 PM",
    location: "Student Center • Dance Room 020",
    cost: "$15",
    images: [
      "/images/pilates-1.jpg",
      "/images/pilates-2.jpg",
      "/images/pilates-3.jpg",
      "/images/pilates-4.jpg",
     
    ],
    description:
      "Beginner-friendly premium pilates experience. Drinks + snacks included. RSVP so we can plan mats, spacing, and the overall setup.",
    href: "/pilates",
    badge: "Open",
  },
];


function EventSlotCard({ event }: { event: EventSlot }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.18 }}
      className="h-full"
    >
      <Link
        href={event.href}
        className={[
          "group block h-full rounded-2xl p-5",
          "border border-black/10 dark:border-white/10",
          "shadow-sm hover:shadow-lg transition-shadow",
          "bg-pink-500 text-white", // <- pink slot
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
        ].join(" ")}
        aria-label={`Open event: ${event.title}`}
      >
        <div className="flex items-start justify-between gap-3">
  <div>
    <h3 className="text-xl font-bold leading-snug">{event.title}</h3>
    <p className="mt-1 text-sm text-white/90">{event.dateLabel}</p>
    <p className="text-sm text-white/90">{event.timeLabel}</p>
    <p className="mt-2 text-sm text-white/90">{event.location}</p>
  </div>

  <div className="shrink-0 text-right">
    {event.badge ? (
      <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
        {event.badge}
      </span>
    ) : null}

    {event.cost ? (
      <div className="mt-2 text-xl font-semibold leading-tight">
        {event.cost}
      </div>
    ) : null}
  </div>
</div>


        {/* Expands on hover (and keyboard focus) */}
        <div
          className={[
            "mt-4 overflow-hidden",
            "max-h-0 opacity-0",
            "transition-all duration-300 ease-out",
            "group-hover:max-h-40 group-hover:opacity-100",
            "group-focus-visible:max-h-40 group-focus-visible:opacity-100",
          ].join(" ")}
        >
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-sm text-white/95">{event.description}</p>
            <p className="mt-2 text-xs font-semibold text-white/95">
              Click to open →
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
function ImageRail({ images = [] }: { images?: string[] }) {
  if (!images.length) return null;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <div className="grid grid-cols-2 gap-3">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              <img
                src={src}
                alt=""
                className="h-36 w-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function Events() {
  return (
    <Layout>
      <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors">
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Upcoming Events
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Choose an event slot to see details and register.
            </p>
            <p className="mt-4 text-sm opacity-70">
              Don’t see an event yet? Follow{" "}
              <Link
                href="https://www.instagram.com/arab_runningclub/"
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
            {EVENTS.length === 0 ? (
              <div className="mx-auto max-w-2xl rounded-2xl border border-black/10 dark:border-white/10 p-8 text-center">
                <p className="text-lg font-semibold">No events posted yet.</p>
                <p className="mt-2 opacity-75">
                  Check back soon. New slots will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-10 lg:grid-cols-[520px_1fr] items-start">
  <div className="grid gap-4">
    {EVENTS.map((e) => (
      <EventSlotCard key={e.id} event={e} />
    ))}
  </div>

  {/* Right-side image wall uses the first event for now */}
  <ImageRail images={EVENTS[0]?.images} />
</div>

            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}
