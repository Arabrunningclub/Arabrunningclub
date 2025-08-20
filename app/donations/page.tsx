"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Layout from "@/components/layout";
import { useSearchParams } from "next/navigation";

export default function Donations() {
  const [amount, setAmount] = useState("10");
  const params = useSearchParams();
  const status = params.get("status"); // "success" | "cancel" | null

  return (
    <Layout>
      <div className="bg-white text-black dark:bg-black dark:text-white transition-colors min-h-screen">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Hero Section */}
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Support Our Mission</h1>
              <p className="text-xl md:text-2xl mb-8">
                Your contributions help us organize community events, support charitable causes, and keep our club growing.
              </p>
            </div>
          </section>

          {/* Donation Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="bg-white dark:bg-black rounded-lg shadow-lg p-6 text-center max-w-lg mx-auto">
                {/* Status banners */}
                {status === "success" && (
                  <div className="mb-4 rounded-lg border border-green-600/40 bg-green-600/10 p-3 text-green-200">
                    Thank you — your donation was successful!
                  </div>
                )}
                {status === "cancel" && (
                  <div className="mb-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-yellow-100">
                    Donation canceled. You were not charged.
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-4">Make a Donation</h2>
                <p className="opacity-80 mb-6">
                  Every dollar helps us create events that strengthen our community and give back to those in need.
                </p>

                <div className="flex justify-center gap-2 mb-4">
                  {["5", "10", "20"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className="px-3 py-1 bg-white text-black border border-black rounded-full hover:bg-black hover:text-white transition-colors"
                    >
                      ${val}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value || "1")}
                    className="w-32 text-center px-3 py-2 rounded-full border border-black/30 dark:border-white/30 bg-transparent"
                  />
                </div>

                {/* Stripe Checkout */}
                <button
                  type="button"
                  className="w-full bg-white text-black px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-colors mb-4"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ amount }),
                      });
                      const data = await res.json();
                      if (data?.url) window.location.href = data.url;
                      else alert(data?.error || "Unable to start checkout");
                    } catch {
                      alert("Network error starting checkout");
                    }
                  }}
                >
                  Donate with Google&nbsp;Pay / Card
                </button>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </Layout>
  );
}