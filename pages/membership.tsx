"use client";

import { motion } from "framer-motion";
import React from "react";
import Layout from "../components/layout";

export default function Membership() {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {/* Main Membership Section */}
        <section className="bg-[#041E42] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Membership</h1>
            <p className="text-xl md:text-2xl mb-8">
              Join our Arab Running Club community and get updates on runs and other events.
            </p>
          </div>
        </section>

        {/* Wayne State University Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-[#041E42] mb-4">
              Wayne State University Students
            </h2>
            <p className="text-gray-700 mb-4">
              If you are a student at Wayne State, be sure to{" "}
              <a 
                href="https://getinvolved.wayne.edu/organization/arabrunningclub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#041E42] underline font-semibold"
              >
                click here
              </a>{" "}
              to get involved. You may also write your school email in the form below, and we will invite you to the university organization.
            </p>
          </div>
        </section>

        {/* Membership Sign-Up Form - Google Form Embed */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl w-full mx-auto">
              <h2 className="text-2xl font-bold text-[#041E42] mb-4 text-center">
                Sign Up for Membership
              </h2>
              <div className="w-full">
                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLSfnO7sP4rSaU3wUMdSQvZKq8hxEyyT5AMORtQIESbdMYqukOQ/viewform?embedded=true"
                  width="100%"
                  height="1200"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  title="Membership Signup Form"
                >
                  Loading…
                </iframe>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </Layout>
  );
}
