"use client";
import Layout from "@/components/layout";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function HomePage() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [email, setEmail] = useState("");

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
        More Than Just a Running Club.
      </h1>
      <p className="mt-4 text-lg md:text-xl text-black dark:text-gray-200 max-w-2xl">
  Join a community that inspires, motivates, and connects through the love of fitness.
</p>
      <div className="mt-6">
        <Link
        href="/events"
        className="inline-block bg-white text-black border font-semibold rounded-full px-6 py-3 hover:bg-black hover:text-white transition-colors"
        >
        Join Us Today
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
    {/* Upcoming Events Call-to-Action */}
    <section className="py-16 bg-white-100 dark:bg-[#000000]">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-8 text-[#00000] dark:text-white">
          Upcoming Events
        </h2>
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
          About Arab Running Club
        </h2>
         <p className="text-lg text-center max-w-3xl mx-auto opacity-80 text-gray-700 dark:text-gray-300">
          Arab Running Club (ARC) is dedicated to promoting health, fitness,
          and community among Arabs. We organize events, support charitable
          causes, and create a space for Arabs to connect through fitness.
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
          Have Questions? Contact Us
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
              window.location.href = `mailto:arabrunningclub@gmail.com?subject=Question from Website&body=${encodeURIComponent(email)}`;
            }}
          >
            Send to arabrunningclub@gmail.com
          </button>
        </form>
      </div>
    </section>
  </Layout>
  );
}
