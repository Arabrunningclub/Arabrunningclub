"use client";

import { motion } from "framer-motion";
import Layout from "@/components/layout";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import Link from "next/link";

export default function Events() {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "Event-rsvp" });
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
      <div className="bg-white text-black dark:bg-black dark:text-white transition-colors min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Upcoming Events
              </h1>
              <p className="text-xl md:text-2xl">
                Join us for our next community event!
              </p>
            </div>
          </section>

          {/* Calendar Section with Cinematic Background */}
          <section
            className="relative w-full flex items-center justify-center min-h-[80vh]"
            style={{
              backgroundImage:
                "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Homepage.jpg-xAsGzsetdgzj2aWAQNwoah9GPVy81z.jpeg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 w-full max-w-5xl rounded-xl shadow-lg p-8 bg-white dark:bg-black bg-opacity-90 backdrop-blur-sm"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
                Register for our latest event!
              </h2>
              <p className="text-lg md:text-xl text-center mb-4">
                Register now to help us create the best experience—we plan based on how many people are coming! 
              </p>
              <p className="text-center mb-6">
                Join us for scenic events around Detroit. All skill levels
                welcome!{" "}
                <Link
                  href="https://www.instagram.com/arab_runningclub/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline"
                >
                  Follow our Instagram
                </Link>{" "}
                for all the latest updates on event locations and times.
              </p>

              <div
                className="scroll-container w-full h-[80vh] max-h-[500px] overflow-auto rounded-lg"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <style jsx>{`
                  .scroll-container::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                <Cal
                  namespace="events-rsvp"
                  calLink="arabrunningclub/events-rsvp"
                  style={{ width: "100%", height: "100%" }}
                  config={{ layout: "month_view" }}
                />
              </div>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </Layout>
  );
}
