import type { Metadata } from "next";
import { CheckoutSuccess } from "@/components/arc-shop/CheckoutSuccess";
import { Footer } from "@/components/arc-shop/Footer";
import { Header } from "@/components/arc-shop/Header";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;
  return (
    <>
      <Header />
      <main>
        <CheckoutSuccess demo={demo === "1"} />
      </main>
      <Footer />
    </>
  );
}
