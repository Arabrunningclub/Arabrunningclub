"use client";

import { motion } from "framer-motion";
import Head from "next/head";
import Layout from "../components/layout";

export default function Donations() {
  return (
    <>
      <Head>
        <title>Donations | Arab Running Club</title>
        <meta
          name="description"
          content="Support Arab Running Club through your donations. Help us foster community and fund charitable runs."
        />
      </Head>
      <Layout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Hero Section */}
          <section className="bg-[#041E42] text-white py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Support Our Mission</h1>
              <p className="text-xl md:text-2xl mb-8">
                Your contributions help us organize community runs, support charitable causes, and keep our club growing.
              </p>
            </div>
          </section>

          {/* Donation Section */}
          <section className="py-16 bg-gray-100">
            <div className="container mx-auto px-4">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-[#041E42] mb-4">Make a Donation</h2>
                <p className="text-gray-600 mb-6">
                  Every dollar helps us create events that strengthen our community and give back to those in need.
                </p>
                <a
                  href="https://www.paypal.com/donate?business=arabrunningclub@gmail.com&no_recurring=0&currency_code=USD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#041E42] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#041E42]/90 transition-colors"
                >
                  Donate with PayPal
                </a>
              </div>
            </div>
          </section>
        </motion.div>
      </Layout>
    </>
  );
}