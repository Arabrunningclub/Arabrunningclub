"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ShopAuthRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/shop/admin") return;

    const hash = window.location.hash;
    const auth = new URLSearchParams(hash.replace(/^#/, ""));
    if (!auth.get("access_token")) return;

    window.location.replace(`/shop/admin${hash}`);
  }, [pathname]);

  return null;
}
