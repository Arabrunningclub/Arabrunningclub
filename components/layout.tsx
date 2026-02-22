"use client";

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Charity", href: "/charity" },
  { name: "Donations", href: "/donations" },
  { name: "Shop", href: "https://shop.wakingup.com/products/work-in-progress-t-shirt?srsltid=AfmBOop1KjQPbEB77g-M3F8egLSPn3CRJ0jgyAkB-xxJk2-8qkjRm0-l&variant=44256900415735", external: true },
  { name: "Gallery", href: "/gallery" },
]

function getInitialTheme() {
  if (typeof window === "undefined") return false
  const saved = localStorage.getItem("theme")
  if (saved) return saved === "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export default function Layout({
  children,
  transparent = false,
}: {
  children: React.ReactNode;
  transparent?: boolean;
}) {

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.classList.toggle("dark", isDark)
    localStorage.setItem("theme", isDark ? "dark" : "light")
  }, [mounted, isDark])

  return (
  <div className="min-h-screen flex flex-col text-black dark:text-white transition-colors">
      <header
  className={[
    "fixed top-0 left-0 right-0 z-50 h-20 backdrop-blur-md border-b shadow-none",
    transparent
      ? "bg-white/10 dark:bg-black/10 border-white/10 dark:border-white/10"
      : "bg-white/10 dark:bg-black/10 border-white/10 dark:border-white/10",
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
            <button className="md:hidden" onClick={() => setIsMenuOpen((v) => !v)} aria-label="Toggle menu">
              <svg
                className="w-6 h-6 text-[#292929] dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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

        <AnimatePresence>
  {isMenuOpen && (
    <>
      {/* click-away overlay */}
      <motion.button
        type="button"
        className="fixed inset-0 z-[40] cursor-default bg-black/5 dark:bg-black/25 md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden
      />

      {/* glass dropdown panel (Gallery-style) */}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className={[
          "md:hidden",
          "fixed left-3 right-3 top-20 z-[50]",          // sits right under your fixed header (h-20)
          "overflow-hidden rounded-2xl",
          "border border-black/10 dark:border-white/10",
          "bg-white/80 dark:bg-black/55 backdrop-blur",
          "shadow-xl",
        ].join(" ")}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) =>
          item.external ? (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="block px-6 py-4 text-lg text-[#292929] dark:text-white transition hover:bg-black/5 dark:hover:bg-white/10"
            >
              {item.name}
            </a>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="block px-6 py-4 text-lg text-[#292929] dark:text-white transition hover:bg-black/5 dark:hover:bg-white/10"
            >
              {item.name}
            </Link>
          )
        )}
      </motion.div>
    </>
  )}
</AnimatePresence>
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
    </div>
  )
}