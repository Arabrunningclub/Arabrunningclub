"use client";

import { motion } from "framer-motion";
import Layout from "@/components/layout"; // ✅ Updated path to App Router format
import Link from "next/link";

export default function Home() {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <section className="bg-[#041E42] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Arab Running Club<sup>™</sup></h1>
            <p className="text-xl md:text-2xl mb-8">Uniting Arabs through fitness and community</p>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
              <Link
                href="/membership"
                className="bg-white text-[#041E42] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Join the Club
              </Link>
              <Link
                href="/events"
                className="bg-[#041E42] text-white px-6 py-3 rounded-full font-semibold border border-white hover:bg-[#041E42]/90 transition-colors"
              >
                See Upcoming Events
              </Link>
              <Link
                href="/charity"
                className="bg-[#041E42] text-white px-6 py-3 rounded-full font-semibold border border-white hover:bg-[#041E42]/90 transition-colors"
              >
                Support Our Cause
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#041E42]">
              About Arab Running Club
            </h2>
            <p className="text-lg text-center max-w-3xl mx-auto text-gray-600">
              Arab Running Club (ARC) is dedicated to promoting health, fitness, and community among Arabs worldwide. We
              organize events, support charitable causes, and create a space for Arabs to connect through fitness.
            </p>
            <div className="text-center mt-8">
              <Link
          href="/about"
          className="inline-block bg-[#041E42] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#041E42]/90 transition-colors"
              >
          Learn More
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#041E42]">Upcoming Events</h2>
            <div className="text-center">
              <Link
                href="/events"
                className="inline-block bg-[#041E42] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#041E42]/90 transition-colors"
              >
                View All Events
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#041E42]">Have Questions? Contact Us.</h2>
            <form className="max-w-md mx-auto">
              <label htmlFor="contact-email" className="sr-only">Email</label>
              <input
                type="email"
                id="contact-email"
                placeholder="Tell us what's on your mind"
                className="w-full px-4 py-2 rounded-full mb-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#041E42]"
              />
              <button
                type="submit"
                className="w-full bg-[#041E42] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#041E42]/90 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `mailto:arabrunningclub@gmail.com?subject=Question from Website&body=${encodeURIComponent(
                    (document.querySelector('#contact-email') as HTMLInputElement)?.value || "",
                  )}`;
                }}
              >
                Send to arabrunningclub@gmail.com
              </button>
            </form>
          </div>
        </section>
      </motion.div>
    </Layout>
  );
}
