"use client";

import { useEffect, useState } from "react";
import type { ArcSiteData } from "@/lib/site-data";

let cached: ArcSiteData | null = null;
let pending: Promise<ArcSiteData | null> | null = null;
let failedAt = 0;
const FAILURE_RETRY_DELAY_MS = 15_000;

async function loadSiteData() {
  if (cached) return cached;
  if (failedAt && Date.now() - failedAt < FAILURE_RETRY_DELAY_MS) return null;
  if (!pending) {
    pending = fetch("/api/site-data")
      .then(async (response) => {
        if (!response.ok) {
          failedAt = Date.now();
          return null;
        }
        const data = (await response.json()) as ArcSiteData;
        if (!data?.ok) {
          failedAt = Date.now();
          return null;
        }
        cached = data;
        failedAt = 0;
        return data;
      })
      .catch(() => {
        failedAt = Date.now();
        return null;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

export function useSiteData() {
  const [data, setData] = useState<ArcSiteData | null>(cached);

  useEffect(() => {
    let active = true;
    loadSiteData().then((result) => {
      if (active && result) setData(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
