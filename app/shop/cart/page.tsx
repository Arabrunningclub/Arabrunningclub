import type { Metadata } from "next";
import { CartPage } from "@/components/arc-shop/CartPage";
import { Footer } from "@/components/arc-shop/Footer";
import { Header } from "@/components/arc-shop/Header";

export const metadata: Metadata = { title: "Your bag" };

export default function BagPage() {
  return (
    <>
      <Header />
      <main>
        <CartPage />
      </main>
      <Footer />
    </>
  );
}
