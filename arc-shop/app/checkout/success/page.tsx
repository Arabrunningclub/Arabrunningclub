import type { Metadata } from "next";
import { CheckoutSuccess } from "@/components/CheckoutSuccess";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

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
