"use client";

import Layout from "@/components/layout";

export default function PilatesPage() {
  return (
    <Layout transparent>
      <iframe
        src="/pilates-embed.html"
        title="Galentine's Pilates RSVP"
        style={{
          width: "100%",
          height: "100vh", // key: fill viewport so header blurs the pink behind it
          border: "none",
          display: "block",
        }}
      />
    </Layout>
  );
}
