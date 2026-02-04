"use client";

import Layout from "@/components/layout";

export default function PilatesClient() {
  return (
    <Layout transparent>
      <iframe
        src="/pilates-embed.html"
        title="Galentine's Pilates RSVP"
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          display: "block",
        }}
      />
    </Layout>
  );
}
