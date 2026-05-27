"use client";

import Layout from "@/components/layout";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function PickleballClient() {
  const params = useSearchParams();
  const status = params.get("status");

  const iframeSrc = useMemo(() => {
    if (!status) return "/pickleball-embed.html";
    return `/pickleball-embed.html?status=${encodeURIComponent(status)}`;
  }, [status]);

  return (
    <Layout transparent>
      <iframe
        src={iframeSrc}
        title="ARC Pickleball Meetup RSVP"
        style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
      />
    </Layout>
  );
}