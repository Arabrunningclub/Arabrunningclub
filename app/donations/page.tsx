"use client";

import { motion } from "framer-motion";
import Head from "next/head";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/layout";

export default function Donations() {
  const [amount, setAmount] = useState("10");
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (paypalLoaded && !paypalError && paypalRef.current && (window as any).paypal) {
      (window as any).paypal
        .Buttons({
          createOrder: (_data: any, actions: any) =>
            actions.order.create({ purchase_units: [{ amount: { value: amount } }] }),
          onApprove: (_data: any, actions: any) => actions.order.capture(),
        })
        .render(paypalRef.current);
    }
  }, [paypalLoaded, paypalError, amount]);

  return (
    <>
      <Head>
        <title>Donations | Arab Running Club</title>
        <meta
          name="description"
          content="Support Arab Running Club through your donations. Help us foster community and fund charitable runs."
        />
        <meta property="og:title" content="Donations | Arab Running Club" />
        <meta
          property="og:description"
          content="Support Arab Running Club through your donations. Help us foster community and fund charitable runs."
        />
      <meta property="og:type" content="website" />
      </Head>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`}
        onLoad={() => setPaypalLoaded(true)}
        onError={() => setPaypalError(true)}
      />
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
                <div className="flex justify-center space-x-2 mb-4">
                  {["5", "10", "20"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className="px-3 py-1 bg-gray-200 rounded-full text-[#041E42] hover:bg-gray-300"
                    >{`$${val}`}</button>
                  ))}
                </div>
                <div className="mb-4">
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border border-gray-300 rounded w-32 px-2 py-1 text-center"
                  />
                </div>
                <div ref={paypalRef} className="inline-block" />
                {paypalError && (
                  <p className="text-red-500 mt-4">PayPal failed to load. Please try again later.</p>
                )}
              </div>
            </div>
          </section>
        </motion.div>
      </Layout>
    </>
  );
}