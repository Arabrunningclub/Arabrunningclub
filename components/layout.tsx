"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  HeartHandshake,
  Home,
  Images,
  ShoppingBag,
} from "lucide-react";
import { useSiteData } from "@/hooks/use-site-data";

const FALLBACK_NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Charity", href: "/charity" },
  { name: "Donations", href: "/donations" },
  {
    name: "Shop",
    href: "/shop",
    external: false,
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
  const siteData = useSiteData();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBottomBarOpen, setIsBottomBarOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);
  const [mounted, setMounted] = useState(false);
  const navItems =
    siteData?.navigation?.length
      ? siteData.navigation.map((item) => ({
          name: item.label,
          href: item.label.toLowerCase() === "shop" ? "/shop" : item.url,
          external:
            item.label.toLowerCase() === "shop" ? false : item.external,
        }))
      : FALLBACK_NAV_ITEMS;
  const organizationName =
    typeof siteData?.settings?.["site.name"] === "string"
      ? String(siteData.settings["site.name"])
      : "Arab Recreational Club";
  const isEventDetailPage = /^\/events\/[^/]+/.test(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsBottomBarOpen(false);
  }, [pathname]);

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
              alt="Arab Recreational Club Logo"
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
        <footer
          className={`bg-background px-4 text-center text-foreground ${
            isEventDetailPage ? "py-6" : "pb-24 pt-6 md:py-6"
          }`}
        >
          © {new Date().getFullYear()} {organizationName}. All rights reserved.
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

      {!isEventDetailPage && (
      <motion.nav
        layout
        aria-label="Quick mobile navigation"
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-[80] md:hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isBottomBarOpen ? (
            <motion.div
              key="expanded-mobile-bar"
              initial={{ opacity: 0, width: 52, scale: 0.92 }}
              animate={{ opacity: 1, width: "auto", scale: 1 }}
              exit={{ opacity: 0, width: 52, scale: 0.92 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="flex items-center gap-1 overflow-hidden rounded-full border border-white/50 bg-white/55 p-1.5 text-neutral-900 shadow-[0_18px_45px_rgba(0,0,0,0.2)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-black/45 dark:text-white"
            >
              {navItems.slice(0, 6).map((item) => {
                const active = !item.external && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
                const content = (
                  <span
                    className={[
                      "grid h-10 w-10 place-items-center rounded-full transition",
                      active ? "bg-neutral-900 text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/10",
                    ].join(" ")}
                  >
                    <MobileNavIcon name={item.name} />
                  </span>
                );

                return item.external ? (
                  <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.name} title={item.name}>
                    {content}
                  </a>
                ) : (
                  <Link key={item.name} href={item.href} aria-label={item.name} title={item.name}>
                    {content}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => setIsBottomBarOpen(false)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                aria-label="Collapse quick navigation"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed-mobile-bar"
              type="button"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.82 }}
              onClick={() => setIsBottomBarOpen(true)}
              className="grid h-[3.25rem] w-[3.25rem] place-items-center rounded-full border border-white/50 bg-white/45 text-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.2)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-black/35 dark:text-white"
              aria-label="Expand quick navigation"
            >
              <ChevronRight className="h-6 w-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.nav>
      )}
    </div>
  );
}

function MobileNavIcon({ name }: { name: string }) {
  const iconClass = "h-5 w-5";
  switch (name.toLowerCase()) {
    case "home":
      return <Home className={iconClass} />;
    case "events":
      return <CalendarDays className={iconClass} />;
    case "charity":
      return <HeartHandshake className={iconClass} />;
    case "donations":
      return <HandCoins className={iconClass} />;
    case "shop":
      return <ShoppingBag className={iconClass} />;
    case "gallery":
      return <Images className={iconClass} />;
    default:
      return <span className="h-2 w-2 rounded-full bg-current" />;
  }
}
