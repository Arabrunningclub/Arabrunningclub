"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Membership", href: "/membership" },
  { name: "Charity", href: "/charity" },
  { name: "Contact", href: "/contact" },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 bg-white shadow-md z-50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="relative w-12 h-12">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Arab%20Running%20Club%20Logo%20Banana-Photoroom-zLifh5jrzUiR4FoCbaAM5N2GOrCXn7.png"
              alt="Arab Running Club Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[#041E42] hover:text-[#041E42]/80 transition-colors"
              >
                {item.name}
              </Link>
            ))}
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
        </nav>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white shadow-md"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 px-4 text-[#041E42] hover:bg-[#041E42]/10 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-[#041E42]">
          © {new Date().getFullYear()} Arab Running Club. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

