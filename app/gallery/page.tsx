"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

type GalleryEvent = {
  id: string;         // used for /gallery#id
  title: string;
  dateLabel: string;  // display
  dateISO: string;    // sort (YYYY-MM-DD)
  cover?: string;
  images: string[];
};

const ARAB_WORLD_SVG =
  "https://upload.wikimedia.org/wikipedia/commons/3/33/Arab_world.svg";

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
      <img src="/instagram.svg" alt="Instagram" className="h-10 w-10 md:h-12 md:w-12" draggable={false} />
    </motion.a>
  );
}

function GlassDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? "All events";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={classNames(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
          "border border-black/10 dark:border-white/10",
          "bg-white/60 dark:bg-white/10 backdrop-blur",
          "shadow-sm hover:shadow-md transition"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="opacity-80">Filter:</span>
        <span>{current}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="ml-1 opacity-80"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={classNames(
              "absolute right-0 mt-2 w-[320px] max-w-[80vw] overflow-hidden rounded-2xl",
              "border border-black/10 dark:border-white/10",
              "bg-white/80 dark:bg-black/55 backdrop-blur",
              "shadow-xl z-[40]"
            )}
            role="listbox"
          >
            {options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={classNames(
                    "w-full text-left px-4 py-3 text-sm transition",
                    active
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-black/5 dark:hover:bg-white/10"
                  )}
                  role="option"
                  aria-selected={active}
                >
                  {o.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* click-away */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[30] cursor-default"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
    </div>
  );
}

export default function GalleryPage() {
  const [activeEvent, setActiveEvent] = useState<string>("all");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const eventsSorted = useMemo(() => {
    return [...GALLERY].sort((a, b) => +new Date(b.dateISO) - +new Date(a.dateISO));
  }, []);

  const flatAll = useMemo(() => flattenGallery(eventsSorted), [eventsSorted]);

  const filteredFlat = useMemo(() => {
    if (activeEvent === "all") return flatAll;
    return flatAll.filter((x) => x.eventId === activeEvent);
  }, [activeEvent, flatAll]);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);

  const prev = () => {
    if (lightboxIdx === null) return;
    setLightboxIdx((i) => (i === null ? null : (i - 1 + filteredFlat.length) % filteredFlat.length));
  };
  const next = () => {
    if (lightboxIdx === null) return;
    setLightboxIdx((i) => (i === null ? null : (i + 1) % filteredFlat.length));
  };

  const active = lightboxIdx !== null ? filteredFlat[lightboxIdx] : null;

  // Jump to /gallery#event-id
  useEffect(() => {
    const hash = window.location.hash?.slice(1);
    if (!hash) return;

    // ensure the event is visible even if filtered (we keep "all" so it scrolls)
    setActiveEvent("all");

    // scroll after paint
    requestAnimationFrame(() => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setHighlightId(hash);
        setTimeout(() => setHighlightId(null), 1200);
      }
    });
  }, []);

  const filterOptions = useMemo(() => {
    return [
      { value: "all", label: "All events" },
      ...eventsSorted.map((e) => ({ value: e.id, label: e.title })),
    ];
  }, [eventsSorted]);

  return (
    <Layout>
      <FloatingInstagram />

      <main className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors overflow-hidden">
        {/* Background: Arab world SVG (visible but subtle) */}
        <div className="pointer-events-none absolute inset-0">
          <motion.img
            src={ARAB_WORLD_SVG}
            alt=""
            className="absolute right-[-140px] top-[-40px] w-[1100px] max-w-none opacity-[0.10] dark:opacity-[0.12] blur-[0.2px]"
            animate={{ y: [0, -10, 0], x: [0, 10, 0], rotate: [0, 0.6, 0] }}
            transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
          />

          {/* soft vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10 dark:to-black/35" />
        </div>

        {/* Header (extra top padding so navbar doesn’t cut it) */}
        <section className="relative pt-24 md:pt-28 pb-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold">ARC Gallery</h1>
                <p className="mt-3 text-lg md:text-2xl opacity-90 max-w-3xl">
                  Recaps from every event
                </p>
                <p className="mt-3 text-bg opacity-70">
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

              <GlassDropdown value={activeEvent} onChange={setActiveEvent} options={filterOptions} />
            </div>
          </div>
        </section>

        {/* Grouped by event (newest -> oldest) */}
        <section className="relative pb-20">
          <div className="container mx-auto px-4">
            {eventsSorted
              .filter((ev) => activeEvent === "all" || ev.id === activeEvent)
              .map((ev) => (
                <section
                  key={ev.id}
                  id={ev.id}
                  className={classNames(
                    "scroll-mt-28 mb-12",
                    highlightId === ev.id &&
                      "ring-2 ring-black/30 dark:ring-white/30 rounded-2xl"
                  )}
                >
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider opacity-60">Event</p>
                      <h2 className="text-2xl font-bold">{ev.title}</h2>
                      <p className="text-sm opacity-70">{ev.dateLabel}</p>
                    </div>
                    <span className="text-sm opacity-70">{ev.images.length} photos</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {ev.images.map((src, i) => {
                      const flatIndex = filteredFlat.findIndex(
                        (x) => x.eventId === ev.id && x.indexInEvent === i
                      );

                      return (
                        <button
                          key={`${src}-${i}`}
                          type="button"
                          onClick={() => openLightbox(flatIndex >= 0 ? flatIndex : 0)}
                          className={classNames(
                            "group relative overflow-hidden rounded-2xl border text-left",
                            "border-black/10 dark:border-white/10",
                            "bg-white/70 dark:bg-white/5 backdrop-blur",
                            "shadow-sm hover:shadow-lg transition"
                          )}
                        >
                          <div className="aspect-[4/3] overflow-hidden">
                            <img
                              src={src}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          </div>

                          <div className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs uppercase tracking-wider opacity-60 truncate">
                                  {ev.title}
                                </p>
                                <p className="text-xs opacity-70">{ev.dateLabel}</p>
                              </div>
                              <span className="text-xs opacity-60">{i + 1}</span>
                            </div>
                          </div>

                          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
                            <div className="absolute left-3 bottom-3 text-xs text-white/90">
                              Click to view
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
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
                    <img src={active.src} alt="" className="w-full max-h-[78vh] object-contain bg-black" />
                    <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
                      {lightboxIdx! + 1}/{filteredFlat.length}
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