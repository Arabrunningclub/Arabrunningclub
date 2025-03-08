"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import Layout from "../components/layout";

export default function Membership() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!name || !email) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitted(true);

    // Special message for Wayne State students
    if (email.endsWith("@wayne.edu")) {
      alert(
        "Thank you for signing up with your Wayne State University email! We will invite you to the organization."
      );
    }
  };

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
              </a> 
              {" "} to get involved. You may also write your school email in the form below, and we will invite you to the university organization.
            </p>
          </div>
        </section>

        {/* Membership Sign-Up Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full mx-auto">
              <h2 className="text-2xl font-bold text-[#041E42] mb-4 text-center">
                Sign Up for Membership
              </h2>
              {submitted ? (
                <p className="text-green-600 font-semibold text-center">
                  ✅ Thank you for signing up!
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-semibold">
                      Name:
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring focus:ring-[#041E42]"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-semibold">
                      Email:
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring focus:ring-[#041E42]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#041E42] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#041E42]/90 transition-colors"
                  >
                    Sign Up
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </motion.div>
    </Layout>
  );
}
