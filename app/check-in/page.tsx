import type { Metadata } from "next";
import Layout from "@/components/layout";
import CheckInClient from "./CheckInClient";

export const metadata: Metadata = {
  title: "Event Check-in",
  robots: { index: false, follow: false },
};

export default function CheckInPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <Layout>
      <section className="min-h-screen bg-[#07101f] px-5 pb-16 pt-32">
        <div className="mx-auto max-w-2xl">
          <CheckInClient token={String(searchParams.token || "")} />
        </div>
      </section>
    </Layout>
  );
}
