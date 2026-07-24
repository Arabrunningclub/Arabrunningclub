import type { Metadata } from "next";
import { MotionProvider } from "@/components/arc-shop/MotionProvider";
import { StoreProvider } from "@/components/arc-shop/StoreProvider";
import "./shop.css";

export const metadata: Metadata = {
  title: {
    default: "ARC Shop — Movement apparel for every pace",
    template: "%s — ARC Shop",
  },
  description:
    "Technical movement apparel and considered daily uniform from Arab Recreational Club.",
  openGraph: {
    type: "website",
    siteName: "ARC Shop",
    title: "Move as one.",
    description:
      "Technical essentials for training, transit, and everything between.",
    images: ["/shop/images/arc-campaign-hero.webp"],
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <div className="arc-shop">
        <MotionProvider />
        {children}
      </div>
    </StoreProvider>
  );
}
