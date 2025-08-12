"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Charity", href: "/charity" },
  { name: "Donations", href: "/donations" },
  { name: "Shop", href: "https://0hx838-nn.myshopify.com/?_ab=0&_fd=0&_sc=1", external: true },
  { name: "Contact", href: "/" },
]

function getInitialTheme() {
  if (typeof window === "undefined") return false
  const saved = localStorage.getItem("theme")
  if (saved) return saved === "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export default function Layout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen flex flex-col bg-white text-black dark:bg-[#181C14] dark:text-white transition-colors">
      <header className="sticky top-0 z-50 shadow-md bg-white text-black dark:bg-[#292929] dark:text-white">
        <nav className="container mx-auto px-0 py-0 flex justify-between items-center">
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

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white dark:bg-[#292929] shadow-md"
          >
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 px-4 text-[#292929] dark:text-white hover:bg-[#292929]/10 transition-colors"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 px-4 text-[#292929] dark:text-white hover:bg-[#292929]/10 transition-colors"
                >
                  {item.name}
                </Link>
              )
            )}
          </motion.div>
        )}
      </header>

      <main className={isDark ? "flex-grow bg-[#181C14]" : "flex-grow bg-white"}>
        {children}
      </main>

      <footer
        className={
          isDark
            ? "bg-[#222831] text-white border-t border-white/20 py-6 text-center"
            : "bg-white text-black border-t border-black/10 py-6 text-center"
        }
      >
        © {new Date().getFullYear()} Arab Running Club. All rights reserved.
      </footer>
    </div>
  )
}

