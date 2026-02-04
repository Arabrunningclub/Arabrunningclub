import type { Metadata } from "next";
import { Suspense } from "react";
import PilatesClient from "./PilatesClient";

export const metadata: Metadata = {
  title: "Galentine’s Pilates | Arab Running Club",
  description:
    "Join our Galentine’s Pilates session at Wayne State. Limited spots. Register now.",
  openGraph: {
    title: "Galentine’s Pilates | Arab Running Club",
    description:
      "Join our Galentine’s Pilates session at Wayne State. Limited spots.",
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

export default function PilatesPage() {
  return (
    <Suspense fallback={null}>
      <PilatesClient />
    </Suspense>
  );
}
