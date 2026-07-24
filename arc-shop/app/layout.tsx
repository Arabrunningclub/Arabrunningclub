import type { Metadata } from "next";
import "./globals.css";
import { MotionProvider } from "@/components/MotionProvider";
import { StoreProvider } from "@/components/StoreProvider";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ARC Shop — Movement apparel for every pace",
    template: "%s — ARC Shop",
  },
  description:
    "Technical movement apparel and considered daily uniform from Arab Recreational Club.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "ARC Shop",
    title: "Move as one.",
    description:
      "Technical essentials for training, transit, and everything between.",
    images: ["/social-card.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <MotionProvider />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
