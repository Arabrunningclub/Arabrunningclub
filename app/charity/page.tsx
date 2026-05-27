"use client";

import { motion } from "framer-motion";
import Layout from "@/components/layout";

function CharityAmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* soft full-page glow */}
      <motion.div
        aria-hidden
        className="absolute inset-[-25%] blur-3xl"
        style={{
          background: `
            radial-gradient(60% 80% at 50% 0%, rgba(189,196,207,0.35) 0%, rgba(189,196,207,0.10) 34%, rgba(189,196,207,0.035) 58%, rgba(0,0,0,0) 78%),
            radial-gradient(42% 68% at 74% 4%, rgba(134,56,56,0.24) 0%, rgba(134,56,56,0.10) 36%, rgba(134,56,56,0.03) 60%, rgba(0,0,0,0) 80%),
            radial-gradient(38% 60% at 18% 12%, rgba(128,132,138,0.13) 0%, rgba(128,132,138,0.07) 40%, rgba(0,0,0,0) 76%),
            radial-gradient(34% 55% at 82% 72%, rgba(34,197,94,0.14) 0%, rgba(34,197,94,0.055) 42%, rgba(0,0,0,0) 76%),
            radial-gradient(30% 42% at 12% 82%, rgba(22,163,74,0.10) 0%, rgba(22,163,74,0.04) 44%, rgba(0,0,0,0) 78%)
          `,
        }}
        animate={{
          opacity: [0.8, 1, 0.9, 0.98, 0.8],
          scale: [1, 1.015, 1.01, 1.02, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* top diffusion */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-32 md:h-44 blur-2xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(192,198,210,0.13) 0%, rgba(142,70,70,0.08) 35%, rgba(34,197,94,0.055) 62%, rgba(0,0,0,0) 100%)",
        }}
        animate={{ opacity: [0.6, 0.85, 0.7, 0.6] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* lower green/red continuity */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-[14rem] bottom-0 opacity-60 blur-3xl"
        style={{
          background: `
            radial-gradient(40% 30% at 18% 30%, rgba(120,120,120,0.08), rgba(0,0,0,0) 70%),
            radial-gradient(34% 28% at 82% 44%, rgba(130,52,52,0.075), rgba(0,0,0,0) 72%),
            radial-gradient(38% 34% at 52% 78%, rgba(34,197,94,0.075), rgba(0,0,0,0) 74%)
          `,
        }}
      />

      {/* vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 dark:to-black/30" />
    </div>
  );
}

export default function Charity() {
  return (
    <Layout>
      <main className="relative min-h-screen overflow-hidden bg-white text-black transition-colors dark:bg-black dark:text-white">
        <CharityAmbientBackground />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          {/* Charity Header Section */}
          <section className="pt-32 pb-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="mb-6 text-5xl font-bold md:text-7xl">Charity</h1>
              <p className="mx-auto mb-12 max-w-2xl text-xl opacity-80 md:text-2xl">
                Support those in need with ARC organized fundraisers.
              </p>
            </div>
          </section>

          {/* Gaza Relief Section */}
          <section
  className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden bg-cover bg-center px-4 py-32 text-white"
            style={{
              backgroundImage:
                "url('https://assets-us-01.kc-usercontent.com/99f113b4-e5f7-00d2-23c0-c83ca2e4cfa2/5e28c7f4-d444-4d9c-ac46-9f7a6d783de0/Yemen-malnutrition-2023-UN0793400.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-black/45" />

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55 }}
              className="relative z-10 max-w-3xl rounded-3xl border border-white/15 bg-black/45 p-8 text-center shadow-2xl backdrop-blur-md md:p-10"
            >
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                Urgent: Help Feed Starving Children in Gaza
              </h2>

              <p className="mb-8 text-lg leading-relaxed opacity-95 md:text-xl">
                Join us in making a difference by supporting the{" "}
                <strong>Gaza Emergency</strong> campaign. Your donation helps
                provide urgent relief to families and children in need.
              </p>

              <a
                href="https://www.launchgood.com/v4/campaign/gaza_emergency__arab_running_club"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full border border-red-600 bg-red-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:border-red-700 hover:bg-red-700"
              >
                Donate to Gaza Relief
              </a>
            </motion.div>
          </section>
        </motion.div>
      </main>
    </Layout>
  );
}
