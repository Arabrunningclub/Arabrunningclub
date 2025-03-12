"use client";

import { motion } from "framer-motion";
import Layout from "../components/layout";

export default function About() {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        
        {/* Header Section */}
        <section className="bg-[#041E42] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Mission</h1>
          </div>
        </section>

        {/* Mission, Vision & Join Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#041E42] mb-4">Welcome to Arab Running Club</h2>
                <p className="text-gray-600 text-lg">
                  Welcome to Arab Running Club, where the thrill of running meets the strength of community.
                  Our aim is simple: to unite and empower Arabs across the Detroit metropolitan area through
                  organized runs and social events.
                </p>
                <p className="text-gray-600 text-lg mt-4">
                  Let’s work together to make a difference. We’re excited to collaborate with other organizations
                  as we amplify our impact. Lace up your shoes and take the stride towards a more connected and empowered Arab community!
                </p>
                <p className="text-gray-600 text-lg mt-4">
                  We recognize the importance of lifting each other up. Our commitment goes beyond personal wellness.
                  As we hit the pavement, we focus on giving back. Through fundraising efforts and support for various charities,
                  we aim to create a lasting impact, not only in our local community but also by supporting our home countries.
                </p>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#041E42] mb-4">Our Vision</h2>
                <p className="text-gray-600 text-lg">
                  We envision a thriving Arab community fueled by the joy of running and active living—
                  a group where every step brings us closer regardless of cultural or spiritual background.
                </p>

                <h2 className="text-2xl font-bold text-[#041E42] mt-8 mb-4">Our Mission</h2>
                <p className="text-gray-600 text-lg">
                  We are not just about fitness; we are about forging meaningful relationships.
                  Too often, division has been used to weaken our community, separating us instead of bringing us together.
                  Arab Running Club is dedicated to creating an inclusive environment where Arabs from all walks of life can come
                  together, share experiences, and grow as one unified community.
                </p>

                <h2 className="text-2xl font-bold text-[#041E42] mt-8 mb-4">Join the Movement</h2>
                <p className="text-gray-600 text-lg">
                  Arab Running Club is more than just a running group—it's a movement. Together, we stay active,
                  stay connected, and stay inspired. Join our runs organized for Arabs, by Arabs.
                </p>
                <a
                  href="/membership"
                  className="inline-block mt-8 px-6 py-2 bg-[#041E42] text-white font-bold rounded-full hover:bg-[#03316E] transition duration-300"
                >
                  Join
                </a>
              </div>
            </div>
          </div>
        </section>

      </motion.div>
    </Layout>
  );
}