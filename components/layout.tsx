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
{ name: "Membership", href: "/membership" },
{ name: "Charity", href: "/charity" },
{ name: "Donations", href: "/donations" },
{ name: "Shop", href: "https://0hx838-nn.myshopify.com/?_ab=0&_fd=0&_sc=1", external: true },
{ name: "Contact", href: "/" },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // No system preference detection for dark mode
  }, []);

  return (
    <div className={isDark ? "dark min-h-screen flex flex-col" : "min-h-screen flex flex-col"}>
      <div className={isDark ? "text-white" : ""}>
        <header className={isDark
          ? "sticky top-0 bg-[#181C14] shadow-md z-50"
          : "sticky top-0 bg-white text-black shadow-md z-50"
        }>
          <nav className="container mx-auto px-0 py-0 flex justify-between items-center">
            <Link href="/" className="relative w-24 h-24">
              <Image
                src={isDark ? "/logo-dark.png" : "/logo.png"}
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
                    className="text-[#041E42] hover:text-[#041E42]/80 transition-colors"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-[#041E42] hover:text-[#041E42]/80 transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg
                className="w-6 h-6 text-[#041E42]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="ml-4 bg-transparent hover:bg-gray-300 rounded-full p-2 transition-all duration-200 group"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="inline-block">
                <Image
                  src={
                    isDark
                      ? "/light_mode_24.svg"
                      : "/dark_mode_24.svg"
                  }
                  alt={isDark ? "Light mode (sun)" : "Dark mode (moon)"}
                  width={32}
                  height={32}
                  priority
                  className={
                    isDark
                      ? "transition-all duration-200 group-hover:filter group-hover:invert group-hover:brightness-50 group-hover:sepia group-hover:hue-rotate-[180deg]"
                      : ""
                  }
                />
              </span>
            </button>
          </nav>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-white shadow-md"
            >
              {navItems.map((item) =>
                item.external ? (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-2 px-4 text-[#041E42] hover:bg-[#041E42]/10 transition-colors"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block py-2 px-4 text-[#041E42] hover:bg-[#041E42]/10 transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </motion.div>
          )}
        </header>
        <main className={
          isDark
            ? "flex-grow bg-[#181C14]"
            : "flex-grow bg-white"
        }>
          {children}
        </main>
        <footer className={isDark
          ? "bg-[#222831] text-white border-t border-white/20 py-6 text-center"
          : "bg-white text-black border-t border-black/10 py-6 text-center"
        }>
          © {new Date().getFullYear()} Arab Running Club. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

