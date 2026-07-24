import type { Metadata } from "next";
import { CartPage } from "@/components/CartPage";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

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
