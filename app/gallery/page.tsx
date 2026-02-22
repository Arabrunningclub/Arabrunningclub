"use client";

import { useMemo, useState } from "react";
import Layout from "@/components/layout";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

type GalleryEvent = {
  id: string;
  title: string;
  dateLabel: string;
  dateISO: string; // 
  cover?: string;
  images: string[];
};

const ARAB_WORLD_SVG =
  "https://upload.wikimedia.org/wikipedia/commons/3/33/Arab_world.svg";

// ✅ Put your images here. Keep paths EXACT (case + extension).
// Best practice: store gallery images in /public/images/gallery/<event-id>/...
const GALLERY: GalleryEvent[] = [
  {
    id: "galentines-pilates-2026",
    title: "Galentine’s Pilates @ Wayne State",
    dateLabel: "Feb 21, 2026",
    dateISO: "2026-02-21", 
    cover: "/images/pilates-1.jpeg",
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
  },
  {
    id: "ice-skating-2026",
    title: "Arabs On Ice",
    dateLabel: "Jan 10, 2026",
    dateISO: "2026-01-10",
    cover: "/images/iceskating1.JPG",
    images: [
      "/images/iceskating.jpg",
      "/images/iceskating1.JPG",
      "/images/iceskating3.jpg",
      "/images/iceskating4.jpg",
      
    ],
  },
  // Add more events as you go:
  // {
  //   id: "sunset-run-2026",
  //   title: "Sunset Run + Social",
  //   dateLabel: "Jan 10, 2026",
  //   cover: "/images/gallery/sunset-run-2026/01.jpg",
  //   images: [
  //     "/images/gallery/sunset-run-2026/01.jpg",
  //     "/images/gallery/sunset-run-2026/02.jpg",
  //   ],
  // },
];

// A “subtle flags” layer without needing image assets.
// (Not perfect “all flags”, but it reads as “Arab flags” visually, and looks premium.)
const FLAG_EMOJIS = [
  "🇵🇸", "🇯🇴", "🇱🇧", "🇸🇾", "🇮🇶", "🇸🇦", "🇰🇼", "🇧🇭", "🇶🇦", "🇦🇪", "🇴🇲",
  "🇾🇪", "🇪🇬", "🇸🇩", "🇱🇾", "🇹🇳", "🇩🇿", "🇲🇦", "🇲🇷", "🇸🇴", "🇩🇯", "🇰🇲",
];

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function flattenGallery(events: GalleryEvent[]) {
  const flat: Array<{
    eventId: string;
    eventTitle: string;
    eventDateLabel: string;
    src: string;
    indexInEvent: number;
  }> = [];

  for (const ev of events) {
    ev.images.forEach((src, i) => {
      flat.push({
        eventId: ev.id,
        eventTitle: ev.title,
        eventDateLabel: ev.dateLabel,
        src,
        indexInEvent: i,
      });
    });
  }
  return flat;
}

export default function GalleryPage() {
  const [activeEvent, setActiveEvent] = useState<string>("all");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const all = useMemo(() => {
  const sorted = [...GALLERY].sort(
    (a, b) => +new Date(b.dateISO) - +new Date(a.dateISO)
  );
  return flattenGallery(sorted);
}, []);
  const filtered = useMemo(() => {
    if (activeEvent === "all") return all;
    return all.filter((x) => x.eventId === activeEvent);
  }, [activeEvent, all]);

  // Flags positions (deterministic)
  const flagDots = useMemo(() => {
    // Deterministic “random-ish” layout
    const out: Array<{ left: string; top: string; size: number; emoji: string; delay: number }> = [];
    let seed = 1337;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < 44; i++) {
      const emoji = FLAG_EMOJIS[i % FLAG_EMOJIS.length];
      const left = `${Math.floor(rand() * 100)}%`;
      const top = `${Math.floor(rand() * 100)}%`;
      const size = 14 + Math.floor(rand() * 18);
      const delay = rand() * 2;
      out.push({ left, top, size, emoji, delay });
    }
    return out;
  }, []);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);

  const prev = () => {
    if (lightboxIdx === null) return;
    setLightboxIdx((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
  };
  const next = () => {
    if (lightboxIdx === null) return;
    setLightboxIdx((i) => (i === null ? null : (i + 1) % filtered.length));
  };

  const active = lightboxIdx !== null ? filtered[lightboxIdx] : null;

  return (
    <Layout>
      <main className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors overflow-hidden">
        {/* Background: subtle arab flags */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.10]">
            {flagDots.map((f, i) => (
              <motion.div
                key={i}
                className="absolute select-none"
                style={{ left: f.left, top: f.top, fontSize: f.size }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: [0, -10, 0] }}
                transition={{
                  duration: 8 + (i % 7),
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: f.delay,
                }}
              >
                {f.emoji}
              </motion.div>
            ))}
          </div>

          {/* Background: Arab world SVG, very subtle motion */}
          <motion.img
            src={ARAB_WORLD_SVG}
            alt=""
            className="absolute right-[-140px] top-[-40px] w-[1100px] max-w-none opacity-[0.10] dark:opacity-[0.12] blur-[0.2px]"
            initial={{ y: 0, x: 0, rotate: 0 }}
            animate={{ y: [0, -10, 0], x: [0, 8, 0], rotate: [0, 0.6, 0] }}
            transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
          />

          {/* Soft vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10 dark:to-black/30" />
        </div>

        {/* Header */}
        <section className="relative pt-24 md:pt-28 pb-14">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold">ARC Gallery</h1>
                <p className="mt-3 text-lg md:text-2xl opacity-90 max-w-3xl">
                  Recaps from every event — community, moments, and proof we’re real.
                </p>
                <p className="mt-3 text-sm opacity-70">
                  Want to be featured? Tag{" "}
                  <Link
                    href="https://www.instagram.com/arabrec.club/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    @arabrec.club
                  </Link>
                  .
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-70">Filter:</span>
                <select
  value={activeEvent}
  onChange={(e) => setActiveEvent(e.target.value)}
  className="rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur px-4 py-2 text-sm font-semibold outline-none shadow-sm
             hover:bg-white/70 dark:hover:bg-white/15 transition"
>                
                  <option value="all" className="bg-black text-white">
  All events
</option>
{GALLERY.map((e) => (
  <option key={e.id} value={e.id} className="bg-black text-white">
    {e.title}
  </option>
))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="relative pb-20">
          <div className="container mx-auto px-4">
            {filtered.length === 0 ? (
              <div className="mx-auto max-w-2xl rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-8 text-center">
                <p className="text-lg font-semibold">No photos yet.</p>
                <p className="mt-2 opacity-75">
                  Add images to <code className="opacity-90">GALLERY</code> and they’ll show here.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((img, idx) => (
                  <button
                    key={`${img.src}-${idx}`}
                    type="button"
                    onClick={() => openLightbox(idx)}
                    className={classNames(
                      "group relative overflow-hidden rounded-2xl border text-left",
                      "border-black/10 dark:border-white/10",
                      "bg-white/70 dark:bg-white/5 backdrop-blur",
                      "shadow-sm hover:shadow-lg transition"
                    )}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={img.src}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wider opacity-60">Event</p>
                          <p className="text-sm font-semibold truncate">{img.eventTitle}</p>
                          <p className="text-xs opacity-70">{img.eventDateLabel}</p>
                        </div>
                        <span className="text-xs opacity-60">
                          {img.indexInEvent + 1}
                        </span>
                      </div>
                    </div>

                    {/* hover overlay */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
                      <div className="absolute left-3 bottom-3 text-xs text-white/90">
                        Click to view
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {active && (
            <motion.div
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            >
              <motion.div
                className="w-full max-w-5xl"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                  <div className="flex items-center justify-between px-4 py-3 text-white">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider opacity-70">ARC Gallery</p>
                      <p className="text-sm font-semibold truncate">
                        {active.eventTitle} • {active.eventDateLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={prev}
                        className="rounded-full border border-white/15 px-3 py-1 text-sm hover:bg-white hover:text-black transition"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        className="rounded-full border border-white/15 px-3 py-1 text-sm hover:bg-white hover:text-black transition"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={closeLightbox}
                        className="rounded-full border border-white/15 px-3 py-1 text-sm hover:bg-white hover:text-black transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <img
                      src={active.src}
                      alt=""
                      className="w-full max-h-[78vh] object-contain bg-black"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
                      {lightboxIdx! + 1}/{filtered.length}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}