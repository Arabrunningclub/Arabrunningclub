"use client";

import Layout from "@/components/layout";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useSiteData } from "@/hooks/use-site-data";
import { eventPath, type ArcEvent } from "@/lib/site-data";

type StackCardItem = {
  key: string;
  href: string;
  image: string;
  eyebrow: string;
  title: string;
  detail: string;
};

function StackCardLink({ card, mobile = false }: { card: StackCardItem; mobile?: boolean }) {
  return (
    <Link
      href={card.href}
      className={`group relative block overflow-hidden border border-white/20 bg-slate-900 shadow-2xl shadow-black/30 ${
        mobile ? "aspect-square rounded-[1.75rem]" : "aspect-[4/5] rounded-[2rem] transition duration-500 hover:z-10 hover:-translate-y-4 hover:rotate-0"
      }`}
    >
      <img
        src={card.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/5" />
      <div className={`absolute inset-x-0 bottom-0 text-white ${mobile ? "p-5" : "p-6"}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200 sm:text-xs">
          {card.eyebrow}
        </p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className={`${mobile ? "text-xl" : "text-2xl"} font-black leading-tight`}>{card.title}</h3>
            <p className="mt-1.5 truncate text-xs text-white/75 sm:text-sm">{card.detail}</p>
          </div>
          <span className={`grid shrink-0 place-items-center rounded-full bg-white text-black transition group-hover:rotate-45 ${
            mobile ? "h-10 w-10" : "h-11 w-11"
          }`}>
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EventStack({ events }: { events: ArcEvent[] }) {
  const reduceMotion = useReducedMotion();
  const [mobileOrder, setMobileOrder] = useState([0, 1, 2]);
  const [mobileMoving, setMobileMoving] = useState(false);
  const [mobileResetting, setMobileResetting] = useState(false);
  const eventCards = events.slice(0, 3).map((event) => ({
    key: event.eventId,
    href: eventPath(event),
    image: event.heroImageUrl || "/placeholder.jpg",
    eyebrow: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: event.timeZone || "America/Detroit",
    }).format(new Date(event.startAt)),
    title: event.shortTitle || event.title,
    detail: event.venue || event.cityState,
  }));
  const cards: StackCardItem[] = [
    ...eventCards,
    {
      key: "discover-events",
      href: "/events",
      image: "/images/pilates-1.JPG",
      eyebrow: "Move together",
      title: "Find your next event",
      detail: "Explore the ARC calendar",
    },
    {
      key: "community-gallery",
      href: "/gallery",
      image: "/images/oldarc2.jpeg",
      eyebrow: "Community in motion",
      title: "See ARC in action",
      detail: "Visit the community gallery",
    },
  ].slice(0, 3);

  const positions = [
    "left-[7%] top-0 md:left-[4%] md:top-16",
    "left-[7%] top-12 md:left-[31%] md:top-2",
    "left-[7%] top-24 md:left-[58%] md:top-16",
  ];
  const rotations = ["-rotate-3 md:-rotate-6", "rotate-2 md:rotate-0", "-rotate-1 md:rotate-6"];

  useEffect(() => {
    if (reduceMotion) return;

    let resetTimer = 0;
    let settleTimer = 0;
    const cycleTimer = window.setInterval(() => {
      setMobileMoving(true);
      resetTimer = window.setTimeout(() => {
        setMobileResetting(true);
        setMobileOrder(([front, middle, back]) => [middle, back, front]);
        setMobileMoving(false);
        settleTimer = window.setTimeout(() => setMobileResetting(false), 40);
      }, 850);
    }, 1600);

    return () => {
      window.clearInterval(cycleTimer);
      window.clearTimeout(resetTimer);
      window.clearTimeout(settleTimer);
    };
  }, [reduceMotion]);

  return (
    <section className="overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-20 dark:from-black dark:via-[#08111f] dark:to-black">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
            Built to move together
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-black dark:text-white md:text-6xl">
            ARC in motion
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 dark:text-slate-300">
            Upcoming events and the community around them, layered into one living snapshot.
          </p>
        </div>

        <div className="relative mx-auto mt-10 h-[27rem] md:hidden">
          {cards.map((card, index) => (
            <motion.div
              key={`mobile-${card.key}`}
              className="absolute left-1/2 top-24 w-[74vw] max-w-[19rem]"
              initial={false}
              animate={(() => {
                const slot = mobileOrder.indexOf(index);
                if (mobileResetting && slot === 2) {
                  return { x: "-50%", y: 10, scale: 0.5, opacity: 0, filter: "blur(4px)", zIndex: 1 };
                }
                if (mobileMoving) {
                  if (slot === 0) return { x: "-50%", y: 160, scale: 1.2, opacity: 0, filter: "blur(12px)", zIndex: 4 };
                  if (slot === 1) return { x: "-50%", y: 50, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 3 };
                  return { x: "-50%", y: -15, scale: 0.8, opacity: 1, filter: "blur(0.5px)", zIndex: 2 };
                }
                if (slot === 0) return { x: "-50%", y: 50, scale: 1, opacity: 1, filter: "blur(0px)", zIndex: 3 };
                if (slot === 1) return { x: "-50%", y: -15, scale: 0.8, opacity: 1, filter: "blur(0.5px)", zIndex: 2 };
                return { x: "-50%", y: -58, scale: 0.62, opacity: 1, filter: "blur(1px)", zIndex: 1 };
              })()}
              transition={mobileResetting || reduceMotion ? { duration: 0 } : {
                duration: mobileMoving ? 0.85 : 0.55,
                ease: [0.42, 0, 0.2, 1],
              }}
            >
              <StackCardLink card={card} mobile />
            </motion.div>
          ))}
        </div>

        <div className="relative mx-auto mt-12 hidden h-[35rem] max-w-5xl md:block">
          {cards.map((card, index) => (
            <motion.div
              key={`desktop-${card.key}`}
              className={`absolute w-[38%] ${positions[index]}`}
              style={{ zIndex: index + 1 }}
              initial={{ opacity: 0, y: 120, scale: 0.86 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, delay: index * 0.14, type: "spring", bounce: 0.2 }}
            >
              <div className={rotations[index]}>
                <StackCardLink card={card} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const siteData = useSiteData();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [email, setEmail] = useState("");
  const content = (key: string, fallback: string) =>
    siteData?.content?.[key]?.value || fallback;
  const contactEmail =
    typeof siteData?.settings?.["contact.email"] === "string"
      ? String(siteData.settings["contact.email"])
      : "arabrunningclub@gmail.com";
  const homepageEventCount =
    typeof siteData?.settings?.["events.homepage_count"] === "number"
      ? Number(siteData.settings["events.homepage_count"])
      : 3;
  const upcomingEvents = (siteData?.events || [])
    .filter((event) => new Date(event.endAt).getTime() >= Date.now())
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))
    .slice(0, homepageEventCount);


  // Watch <html class="dark"> toggles from your header button
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));

    // set initial
    update();

    // react to class changes (same-tab)
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });

    // react to localStorage changes (cross-tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme") update();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      obs.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const src = isDark
    ? "https://www.unicorn.studio/embed/MfUph5PAO0DPJ5YsMqwm" // DARK
    : "https://www.unicorn.studio/embed/1qFTrBs8vI0v16hJvmyT"; // LIGHT

  return (
    <Layout>
     {/* Hero: full‑screen Unicorn scene + overlay title + theme-aware bottom cover */}
<section className="relative min-h-screen overflow-hidden">
  <div className="relative h-screen">
    <div className="relative h-full">
      {/* Unicorn scene */}
      <iframe
      key={isDark ? "dark" : "light"}
      src={src}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ border: 0 }}
      allow="autoplay; fullscreen; xr-spatial-tracking"
      allowFullScreen
      loading="eager"
      aria-hidden="true"
      />
      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg text-black dark:text-gray-200">
        {content("home.hero.title", "ARC")}
      </h1>
      <p className="mt-4 text-lg md:text-xl text-black dark:text-gray-200 max-w-2xl">
  {content("home.hero.description", "Join a community that inspires, motivates, and connects through the love of fitness.")}
</p>
      <div className="mt-6">
        <Link
        href="/events"
        className="inline-block bg-white text-black border font-semibold rounded-full px-6 py-3 hover:bg-black hover:text-white transition-colors"
        >
        {content("home.hero.button", "Join Us Today")}
        </Link>
      </div>
      </div>
      {/* Overlay to hide "Made with unicorn.studio" */}
      <div
      className={`absolute bottom-0 left-0 w-full h-[4.15rem] z-10 ${
        isDark ? "bg-[#000000]" : "bg-white"
      }`}
      />
    </div>

    </div>
</section>
    <EventStack events={upcomingEvents} />
    {/* Upcoming Events Call-to-Action */}
    <section className="py-16 bg-white-100 dark:bg-[#000000]">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-8 text-[#00000] dark:text-white">
          {content("home.events.heading", "Upcoming Events")}
        </h2>
        {upcomingEvents.length > 0 && (
          <div className="mx-auto mb-8 grid max-w-5xl gap-4 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Link
                key={event.eventId}
                href={eventPath(event)}
                className="rounded-2xl border border-black/10 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: event.timeZone || "America/Detroit",
                  }).format(new Date(event.startAt))}
                </p>
                <h3 className="mt-2 text-xl font-bold">{event.title}</h3>
                <p className="mt-2 text-sm opacity-75">{event.venue}</p>
              </Link>
            ))}
          </div>
        )}
        <div className="text-center">
          <Link
            href="/events"
            className="inline-block bg-white text-black border border-black px-6 py-3 rounded-full font-semibold hover:bg-black hover:text-white transition-colors"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
    {/* About Section */}
    <section className="py-16 bg-white dark:bg-[#000000]">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-8 text-black dark:text-white">
          {content("home.about.heading", "About Arab Running Club")}
        </h2>
         <p className="text-lg text-center max-w-3xl mx-auto opacity-80 text-gray-700 dark:text-gray-300">
          {content("home.about.body", "Arab Running Club (ARC) is dedicated to promoting health, fitness, and community among Arabs. We organize events, support charitable causes, and create a space for Arabs to connect through fitness.")}
        </p>
        <div className="text-center mt-8">
          <Link
            href="/about"
            className="inline-block bg-white text-black border border-black px-6 py-3 rounded-full font-semibold hover:bg-black hover:text-white transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
    {/* Contact Section */}
    <section className="py-16 bg-gray-100 dark:bg-[#0b0d0e]">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-8 text-black dark:text-white">
          {content("home.contact.heading", "Have Questions? Contact Us")}
        </h2>
        <form className="max-w-md mx-auto">
          <label htmlFor="contact-email" className="sr-only">
            Email
          </label>
          <input
            type="email"
            id="contact-email"
            placeholder="Tell us what's on your mind"
            className="w-full px-4 py-2 rounded-full mb-4 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="button"
            className="w-full bg-white text-black border border-black px-6 py-3 rounded-full font-semibold hover:bg-black hover:text-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `mailto:${contactEmail}?subject=Question from Website&body=${encodeURIComponent(email)}`;
            }}
          >
            Send to {contactEmail}
          </button>
        </form>
      </div>
    </section>
  </Layout>
  );
}
