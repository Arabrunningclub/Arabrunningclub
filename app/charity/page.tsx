"use client";

import { motion } from "framer-motion";
import Layout from "@/components/layout";
import Link from "next/link";

export default function Charity() {
  return (
    <Layout>
      <div className="bg-white text-black dark:bg-black dark:text-white transition-colors min-h-screen">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>

          {/* Charity Header Section */}
          <section className="pt-32 pb-20"> {/* ⬅️ added more top padding */}
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">Charity</h1> {/* ⬅️ made text larger + more margin */}
              <p className="text-xl md:text-2xl mb-12">
                Support where you came from with ARC organized fundraisers.
              </p>
            </div>
          </section>

          {/* Special Section for Gaza Relief */}
          <section
            className="py-32 bg-cover bg-center text-white min-h-[80vh]" 
            style={{
              backgroundImage: "url('https://assets-us-01.kc-usercontent.com/99f113b4-e5f7-00d2-23c0-c83ca2e4cfa2/5e28c7f4-d444-4d9c-ac46-9f7a6d783de0/Yemen-malnutrition-2023-UN0793400.jpg')",
            }}
          >
            <div className="container mx-auto px-4 text-center bg-black bg-opacity-50 p-10 rounded-xl max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Urgent: Help Feed Starving Children in Gaza
              </h2>
              <p className="text-lg md:text-xl mb-8">
                Join us in making a difference by supporting the <strong>Gaza Emergency</strong> campaign.
                Your donation will help provide food for starving children in Yemen.
              </p>
              <a
                href="https://www.launchgood.com/v4/campaign/gaza_emergency__arab_running_club"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-red-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-red-700 transition-colors text-lg"
              >
                Donate to Gaza Relief
              </a>
            </div>
          </section>
        </motion.div>
      </div>
    </Layout>
  );
}

