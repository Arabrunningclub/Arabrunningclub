"use client";

import { motion } from "framer-motion";
import Layout from "@/components/layout";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function Events() {
  const { theme, systemTheme } = useTheme();
  const resolved = theme === "system" ? systemTheme : theme;
  const isDark = resolved === "dark";

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "5k-run-rsvp" });

      // Tell Cal to match your site theme and colors
      cal("ui", {
        theme: isDark ? "dark" : "light",
        cssVarsPerTheme: {
          light: {
            "cal-text": "#0f1217",
            "cal-bg": "#ffffff",
            "cal-bg-emphasis": "#f6f7f9",
            "cal-border": "#e5e7eb",
            "cal-brand": "#041E42",
          },
          dark: {
            "cal-text": "#e8ebf1",
            "cal-bg": "#0b0d0e",
            "cal-bg-emphasis": "#1a1c21",
            "cal-border": "#2a2f36",
            "cal-brand": "#ffffff",
          },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, [isDark]); // <- re-run when theme flips

  return (
    <Layout>
      {/* ...your hero section... */}

      <section className="relative w-full flex items-center justify-center min-h-[80vh]">
        {/* overlay/bg ... */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-5xl rounded-xl shadow-lg p-8"
          // subtle card surface that matches your tokens
          style={{ background: "rgba(255,255,255,0.9)" }}
        >
          {/* ...title, text... */}

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
              namespace="5k-run-rsvp"
              calLink="arabrunningclub/5k-run-rsvp"
              style={{ width: "100%", height: "100%" }}
              config={{ layout: "month_view" }}
            />
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}
