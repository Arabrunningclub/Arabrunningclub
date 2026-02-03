import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galentine’s Pilates | Arab Running Club",
  description: "Join our Galentine’s Pilates session at Wayne State. Limited spots. Register now.",

  openGraph: {
    title: "Galentine’s Pilates | Arab Running Club",
    description: "Join our Galentine’s Pilates session at Wayne State. Limited spots.",
    url: "https://www.arab-runningclub.com/pilates",
    siteName: "Arab Running Club",
    images: [
      {
        url: "https://www.arab-runningclub.com/pilates-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Galentine’s Pilates Event",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Galentine’s Pilates | Arab Running Club",
    description: "Join our Galentine’s Pilates session at Wayne State.",
    images: ["https://www.arab-runningclub.com/pilates-preview.jpg"],
  },
};

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
