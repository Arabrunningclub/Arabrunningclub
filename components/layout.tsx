"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Charity", href: "/charity" },
  { name: "Donations", href: "/donations" },
  {
    name: "Shop",
    href: "https://shop.wakingup.com/products/work-in-progress-t-shirt?srsltid=AfmBOop1KjQPbEB77g-M3F8egLSPn3CRJ0jgyAkB-xxJk2-8qkjRm0-l&variant=44256900415735",
    external: true,
  },
  { name: "Gallery", href: "/gallery" },
];

function getInitialTheme() {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("theme");
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function Layout({
  children,
  transparent = false,
}: {
  children: React.ReactNode;
  transparent?: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [mounted, isDark]);

  // lock scroll when mobile menu is open (makes it feel like a true overlay)
  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col text-black dark:text-white transition-colors">
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 h-20 border-b",
          "backdrop-blur-2xl backdrop-saturate-150",
          transparent
            ? "bg-white/10 dark:bg-black/15 border-white/10 dark:border-white/10"
            : "bg-white/70 dark:bg-black/70 supports-[backdrop-filter]:bg-white/15 supports-[backdrop-filter]:dark:bg-black/20 border-black/10 dark:border-white/10",
        ].join(" ")}
      >
        <nav className="container mx-auto h-20 px-0 py-0 flex justify-between items-center">
          <Link href="/" className="relative w-24 h-24">
            <Image
              src={mounted && isDark ? "/logo-dark.png" : "/logo.png"}
              alt="Arab Running Club Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>

          <div className="hidden md:flex space-x-4">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-colors text-[#041E42] dark:text-white"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="hover:opacity-80 transition-colors text-[#041E42] dark:text-white"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-[#292929] dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <button
              onClick={() => setIsDark((prev) => !prev)}
              className="ml-2 grid place-items-center w-10 h-10 rounded-full hover:bg-[rgb(var(--surface))] transition"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {mounted ? (
                <Image
                  src={isDark ? "/light_mode_24.svg" : "/dark_mode_24.svg"}
                  alt={isDark ? "Light mode (sun)" : "Dark mode (moon)"}
                  width={28}
                  height={28}
                  priority
                />
              ) : (
                <span className="inline-block w-5 h-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <main
        className={[
          "flex-grow",
          transparent ? "bg-transparent" : isDark ? "bg-[#181C14]" : "bg-white",
        ].join(" ")}
      >
        {children}
      </main>

      {!transparent && (
        <footer className="bg-background text-foreground py-6 text-center">
          © {new Date().getFullYear()} Arab Recreational Club. All rights reserved.
        </footer>
      )}

      {/* MOBILE MENU OVERLAY (kept at root level so it overlays page, not inside header layout) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* background dim / blur helper */}
            <motion.button
              type="button"
              className="fixed inset-0 z-[60] md:hidden bg-black/35 dark:bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              aria-hidden
            />

            {/* ultra frosted dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.99 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className={[
                "md:hidden fixed left-3 right-3 z-[70]",
                // tight under the navbar (adjust by 1-2px if you want)
                "top-[4.05rem]",
                "rounded-2xl overflow-hidden",
                "border border-white/15 dark:border-white/10",
                // lighter tint so you can actually see the blur; darker fallback if blur unsupported
                "bg-black/45 dark:bg-black/50",
                "supports-[backdrop-filter]:bg-white/[0.06] supports-[backdrop-filter]:dark:bg-black/[0.18]",
                // SUPER blur
                "backdrop-blur-[72px] backdrop-saturate-[2] backdrop-brightness-110",
                "shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
              ].join(" ")}
              role="navigation"
              aria-label="Mobile navigation"
            >
              {/* frosted highlights */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 via-white/[0.04] to-transparent dark:from-white/10 dark:via-white/[0.02]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />

              {/* NO divider lines; use spacing instead */}
              <div className="relative p-2">
                {navItems.map((item) =>
                  item.external ? (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-xl px-4 py-4 text-[1.05rem] text-white/95 transition hover:bg-white/10 active:bg-white/15"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-xl px-4 py-4 text-[1.05rem] text-white/95 transition hover:bg-white/10 active:bg-white/15"
                    >
                      {item.name}
                    </Link>
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}