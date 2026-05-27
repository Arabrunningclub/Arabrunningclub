import type { Metadata } from "next";
import { Suspense } from "react";
import PickleballClient from "./PickleballClient";

export const metadata: Metadata = {
  title: "ARC Pickleball Meetup | Arab Running Club",
  description:
    "Join ARC for a community pickleball meetup. All skill levels are welcome.",
  openGraph: {
    title: "ARC Pickleball Meetup | Arab Running Club",
    description:
      "Join ARC for a community pickleball meetup and connect with the community.",
    url: "https://www.arab-runningclub.com/pickleball",
    siteName: "Arab Running Club",
    images: [
      {
        url: "https://www.arab-runningclub.com/pickleball-preview.jpg",
        width: 1200,
        height: 630,
        alt: "ARC Pickleball Meetup",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARC Pickleball Meetup | Arab Running Club",
    description:
      "Join ARC for a community pickleball meetup.",
    images: [
      "https://www.arab-runningclub.com/pickleball-preview.jpg",
    ],
  },
};

export default function PickleballPage() {
  return (
    <Suspense fallback={null}>
      <PickleballClient />
    </Suspense>
  );
}