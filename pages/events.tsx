"use client";

import { motion } from "framer-motion";
import Layout from "../components/layout";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function Events() {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "5k-run-rsvp" });
      cal("ui", {
        cssVarsPerTheme: {
          light: { "cal-brand": "#041E42" },
          dark: { "cal-brand": "#FFFFFF" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <section className="bg-[#041E42] text-white py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Upcoming Events</h1>
            <p className="text-xl md:text-2xl">
              Join us for our next community run
            </p>
          </div>
        </section>
      </motion.div>

      {/* Calendar Section with Cinematic Background */}
      <section
        className="relative w-full flex items-center justify-center min-h-[800px]"
        style={{
          backgroundImage:
            "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Homepage.jpg-xAsGzsetdgzj2aWAQNwoah9GPVy81z.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

        {/* Calendar embed container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-5xl bg-white bg-opacity-90 rounded-xl shadow-lg p-8 backdrop-blur-sm"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#041E42] mb-2">
            Register for our latest 5K run!
          </h2>
          <p className="text-lg md:text-xl text-center text-[#041E42] mb-4">
            By registering, you help us plan better and ensure we can accommodate everyone.
          </p>
          <p className="text-center text-gray-700 mb-6">
            Join us for a scenic run around Detroit. All skill levels welcome!{" "}
            <span className="font-bold text-[#041E42] underline">
              Follow our Instagram
            </span>{" "}
            for all the latest updates on run locations and times.
          </p>

          <div
            className="w-full h-[500px] overflow-hidden rounded-lg relative"
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
            }}
          >
            <style jsx>{`
              div.w-full.h-[500px]::-webkit-scrollbar {
                display: none; /* Chrome, Safari, and Edge */
              }
              div.w-full.h-[500px] {
                -ms-overflow-style: none; /* IE and Edge */
                scrollbar-width: none; /* Firefox */
              }
            `}</style>

            {/* Transparent overlay to cover arrows and slim rectangle */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "transparent",
                zIndex: 10,
              }}
            />

            <Cal
              namespace="5k-run-rsvp"
              calLink="arabrunningclub/5k-run-rsvp"
              style={{
                width: "100%",
                height: "100%",
                transform: "scale(1.0)",
                transformOrigin: "top left",
              }}
              config={{
                layout: "month_view",
                branding: { "hide-cal-link": "true" }, // Keeps "cal.com" branding hidden
              }}
            />
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}
// This code is a Next.js page that displays a calendar for upcoming events using the Cal.com embed feature.