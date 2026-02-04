"use client";

import Layout from "@/components/layout";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function PilatesClient() {
  const params = useSearchParams();
  const status = params.get("status"); // "success" | "cancel" | null

  const iframeSrc = useMemo(() => {
    if (!status) return "/pilates-embed.html";
    return `/pilates-embed.html?status=${encodeURIComponent(status)}`;
  }, [status]);

  return (
    <Layout transparent>
      <iframe
        src={iframeSrc}
        title="Galentine's Pilates RSVP"
        style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
      />
    </Layout>
  );
}
