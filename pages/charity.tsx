"use client";

import { motion } from "framer-motion";
import Layout from "../components/layout";

export default function Charity() {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>

        {/* Charity Header Section */}
        <section className="bg-[#041E42] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Charity</h1>
            <p className="text-xl md:text-2xl mb-8">
              Support our community initiatives through our charity runs.
            </p>
          </div>
        </section>

        {/* How to Help Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-[#041E42] mb-4">How You Can Help</h2>
              <p className="text-gray-600">
                Participate in our charity runs or donate to support the cause.
              </p>
                <a
                href="/donations"
                className="mt-4 inline-block bg-[#041E42] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#041E42]/90 transition-colors"
                >
                Donate Now
                </a>
            </div>
          </div>
        </section>

        {/* Special Section for Yemen Relief */}
        <section 
          className="py-16 bg-cover bg-center text-white" 
          style={{ backgroundImage: "url('https://assets-us-01.kc-usercontent.com/99f113b4-e5f7-00d2-23c0-c83ca2e4cfa2/5e28c7f4-d444-4d9c-ac46-9f7a6d783de0/Yemen-malnutrition-2023-UN0793400.jpg')" }}
        >
          <div className="container mx-auto px-4 text-center bg-black bg-opacity-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Urgent: Help Feed Starving Children in Yemen</h2>
            <p className="text-lg mb-6">
              Join us in making a difference by supporting the <strong>Hope for Yemen</strong> campaign.
              Your donation will help provide food for starving children in Yemen.
            </p>
            <a
              href="https://www.launchgood.com/v4/campaign/hope_for_yemen_help_feed_starving_children_in_yemen?src=4171180"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
            >
              Donate to Yemen Relief
            </a>
          </div>
        </section>

      </motion.div>
    </Layout>
  );
}
